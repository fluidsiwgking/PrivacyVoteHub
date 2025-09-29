export const PrivacyVoteHubABI = {
  "abi": [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "topicId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint32[]",
          "name": "counts",
          "type": "uint32[]"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "proof",
          "type": "string"
        }
      ],
      "name": "AggregationPublished",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "topicId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "voter",
          "type": "address"
        }
      ],
      "name": "EncryptedSubmitted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "topicId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "openAt",
          "type": "uint64"
        },
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "closeAt",
          "type": "uint64"
        }
      ],
      "name": "TopicOpened",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "details",
          "type": "string"
        },
        {
          "internalType": "string[]",
          "name": "options",
          "type": "string[]"
        },
        {
          "internalType": "uint64",
          "name": "openAt",
          "type": "uint64"
        },
        {
          "internalType": "uint64",
          "name": "closeAt",
          "type": "uint64"
        },
        {
          "internalType": "uint32",
          "name": "maxPer",
          "type": "uint32"
        }
      ],
      "name": "createTopic",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "topicId",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "topicId",
          "type": "uint256"
        }
      ],
      "name": "getAggregation",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "topicId",
              "type": "uint256"
            },
            {
              "internalType": "uint32[]",
              "name": "counts",
              "type": "uint32[]"
            },
            {
              "internalType": "string",
              "name": "proof",
              "type": "string"
            },
            {
              "internalType": "uint64",
              "name": "ts",
              "type": "uint64"
            }
          ],
          "internalType": "struct PrivacyVoteHub.PublishInfo",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "topicId",
          "type": "uint256"
        }
      ],
      "name": "getEncryptedAggregate",
      "outputs": [
        {
          "internalType": "euint32[]",
          "name": "",
          "type": "bytes32[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "topicId",
          "type": "uint256"
        }
      ],
      "name": "getTopic",
      "outputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "details",
          "type": "string"
        },
        {
          "internalType": "string[]",
          "name": "options",
          "type": "string[]"
        },
        {
          "internalType": "uint64",
          "name": "openAt",
          "type": "uint64"
        },
        {
          "internalType": "uint64",
          "name": "closeAt",
          "type": "uint64"
        },
        {
          "internalType": "bool",
          "name": "published",
          "type": "bool"
        },
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTopicCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "topicId",
          "type": "uint256"
        }
      ],
      "name": "getTopicStatus",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "topicId",
          "type": "uint256"
        }
      ],
      "name": "maxVotesPerAddress",
      "outputs": [
        {
          "internalType": "uint32",
          "name": "",
          "type": "uint32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "protocolId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "topicId",
          "type": "uint256"
        },
        {
          "internalType": "uint32[]",
          "name": "counts",
          "type": "uint32[]"
        },
        {
          "internalType": "string",
          "name": "proof",
          "type": "string"
        }
      ],
      "name": "publishAggregation",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "topicId",
          "type": "uint256"
        },
        {
          "internalType": "externalEuint32",
          "name": "input",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "proof",
          "type": "bytes"
        }
      ],
      "name": "submitCipherIndex",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "topicId",
          "type": "uint256"
        },
        {
          "internalType": "externalEuint32[]",
          "name": "onehot",
          "type": "bytes32[]"
        },
        {
          "internalType": "bytes",
          "name": "proof",
          "type": "bytes"
        }
      ],
      "name": "submitCipherOneHot",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "topicId",
          "type": "uint256"
        }
      ],
      "name": "usedVotesBy",
      "outputs": [
        {
          "internalType": "uint32",
          "name": "",
          "type": "uint32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
} as const;