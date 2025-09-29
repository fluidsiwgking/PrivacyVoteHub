// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title PrivacyVoteHub — FHEVM 私密投票（方法名和结构与 SecretBallotBox 不同）
contract PrivacyVoteHub is SepoliaConfig {
    struct Topic {
        string name;
        string details;
        string[] options;
        uint64 openAt;
        uint64 closeAt;
        address owner;
        bool published;
    }

    struct CipherBallot {
        uint256 id;
        uint256 topicId;
        euint32 choice;
        address voter;
    }

    struct PublishInfo {
        uint256 topicId;
        uint32[] counts;
        string proof;
        uint64 ts;
    }

    event TopicOpened(uint256 indexed topicId, address indexed owner, string name, uint64 openAt, uint64 closeAt);
    event EncryptedSubmitted(uint256 indexed topicId, address indexed voter);
    event AggregationPublished(uint256 indexed topicId, uint32[] counts, string proof);

    uint256 private _topicSeq;
    uint256 private _ballotSeq;

    mapping(uint256 => Topic) private _topics;
    mapping(uint256 => uint256[]) private _topicBallots;
    mapping(uint256 => CipherBallot) private _ballots;
    mapping(uint256 => mapping(address => uint32)) private _votedCount;
    mapping(uint256 => uint32) private _maxPerAddress;
    mapping(uint256 => euint32[]) private _encryptedAggregates;
    mapping(uint256 => PublishInfo) private _published;

    modifier topicExists(uint256 topicId) {
        require(bytes(_topics[topicId].name).length != 0, "topic missing");
        _;
    }

    function createTopic(
        string memory name,
        string memory details,
        string[] memory options,
        uint64 openAt,
        uint64 closeAt,
        uint32 maxPer
    ) external returns (uint256 topicId) {
        require(bytes(name).length > 0, "name");
        require(options.length >= 2, "options");
        require(closeAt > openAt && closeAt > block.timestamp, "time");
        _topicSeq += 1;
        topicId = _topicSeq;
        Topic storage t = _topics[topicId];
        t.name = name;
        t.details = details;
        t.options = options;
        t.openAt = openAt;
        t.closeAt = closeAt;
        t.owner = msg.sender;
        t.published = false;
        _maxPerAddress[topicId] = maxPer == 0 ? 1 : maxPer;
        emit TopicOpened(topicId, msg.sender, name, openAt, closeAt);
    }

    function submitCipherIndex(uint256 topicId, externalEuint32 input, bytes calldata proof) external topicExists(topicId) {
        Topic storage t = _topics[topicId];
        require(block.timestamp >= t.openAt && block.timestamp <= t.closeAt, "window");
        uint32 used = _votedCount[topicId][msg.sender];
        require(used < _maxPerAddress[topicId], "quota");
        _votedCount[topicId][msg.sender] = used + 1;
        euint32 enc = FHE.fromExternal(input, proof);
        FHE.allowThis(enc);
        FHE.allow(enc, msg.sender);
        _ballotSeq += 1;
        uint256 bid = _ballotSeq;
        _ballots[bid] = CipherBallot({id: bid, topicId: topicId, choice: enc, voter: msg.sender});
        _topicBallots[topicId].push(bid);
        emit EncryptedSubmitted(topicId, msg.sender);
    }

    function submitCipherOneHot(uint256 topicId, externalEuint32[] calldata onehot, bytes calldata proof) external topicExists(topicId) {
        Topic storage t = _topics[topicId];
        require(block.timestamp >= t.openAt && block.timestamp <= t.closeAt, "window");
        require(onehot.length == t.options.length, "len");
        uint32 used = _votedCount[topicId][msg.sender];
        require(used < _maxPerAddress[topicId], "quota");
        _votedCount[topicId][msg.sender] = used + 1;
        euint32[] memory enc = new euint32[](onehot.length);
        for (uint256 i = 0; i < onehot.length; i++) {
            enc[i] = FHE.fromExternal(onehot[i], proof);
        }
        euint32[] storage agg = _encryptedAggregates[topicId];
        if (agg.length == 0) {
            for (uint256 i = 0; i < enc.length; i++) agg.push(enc[i]);
        } else {
            require(agg.length == enc.length, "agg-len");
            for (uint256 i = 0; i < enc.length; i++) {
                agg[i] = FHE.add(agg[i], enc[i]);
            }
        }
        for (uint256 i = 0; i < enc.length; i++) {
            FHE.allowThis(agg[i]);
            FHE.allow(agg[i], t.owner);
            FHE.allow(agg[i], msg.sender);
        }
        emit EncryptedSubmitted(topicId, msg.sender);
    }

    function getTopic(uint256 topicId)
        external
        view
        topicExists(topicId)
        returns (string memory name, string memory details, string[] memory options, uint64 openAt, uint64 closeAt, bool published, address owner)
    {
        Topic storage t = _topics[topicId];
        return (t.name, t.details, t.options, t.openAt, t.closeAt, t.published, t.owner);
    }

    function getTopicCount() external view returns (uint256) { return _topicSeq; }

    function getTopicStatus(uint256 topicId) external view topicExists(topicId) returns (uint8) {
        Topic storage t = _topics[topicId];
        if (t.published) return 3;
        if (block.timestamp < t.openAt) return 0;
        if (block.timestamp <= t.closeAt) return 1;
        return 2;
    }

    function getEncryptedAggregate(uint256 topicId) external view topicExists(topicId) returns (euint32[] memory) {
        euint32[] storage agg = _encryptedAggregates[topicId];
        euint32[] memory out = new euint32[](agg.length);
        for (uint256 i = 0; i < agg.length; i++) out[i] = agg[i];
        return out;
    }

    function publishAggregation(uint256 topicId, uint32[] calldata counts, string calldata proof) external topicExists(topicId) {
        Topic storage t = _topics[topicId];
        require(block.timestamp > t.closeAt, "not closed");
        require(!t.published, "published");
        require(counts.length == t.options.length, "len");
        _published[topicId] = PublishInfo({topicId: topicId, counts: counts, proof: proof, ts: uint64(block.timestamp)});
        t.published = true;
        emit AggregationPublished(topicId, counts, proof);
    }

    function getAggregation(uint256 topicId) external view topicExists(topicId) returns (PublishInfo memory) { return _published[topicId]; }

    function usedVotesBy(address user, uint256 topicId) external view returns (uint32) { return _votedCount[topicId][user]; }
    function maxVotesPerAddress(uint256 topicId) external view returns (uint32) { return _maxPerAddress[topicId]; }
}




