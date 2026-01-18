export const abi = [
  /* ───────── EVENTS ───────── */

  {
    type: "event",
    name: "CampaignCreated",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "owner", type: "address", indexed: true }
    ],
  },
  {
    type: "event",
    name: "DonationMade",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "donator", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false }
    ],
  },
  {
    type: "event",
    name: "CampaignSuccessful",
    inputs: [
      { name: "id", type: "uint256", indexed: true }
    ],
  },
  {
    type: "event",
    name: "CampaignFailed",
    inputs: [
      { name: "id", type: "uint256", indexed: true }
    ],
  },
  {
    type: "event",
    name: "Withdrawn",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "amount", type: "uint256", indexed: false }
    ],
  },
  {
    type: "event",
    name: "Refunded",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "user", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false }
    ],
  },

  /* ───────── WRITE ───────── */

  {
    type: "function",
    name: "createCampaign",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_title", type: "string" },
      { name: "_description", type: "string" },
      { name: "_target", type: "uint256" },
      { name: "_deadline", type: "uint256" },
      // { name: "_image", type: "string" }
    ],
    outputs: [{ name: "", type: "uint256" }]
  },

  {
    type: "function",
    name: "donate",
    stateMutability: "payable",
    inputs: [{ name: "_id", type: "uint256" }],
    outputs: []
  },

  {
    type: "function",
    name: "finalize",
    stateMutability: "nonpayable",
    inputs: [{ name: "_id", type: "uint256" }],
    outputs: []
  },

  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [{ name: "_id", type: "uint256" }],
    outputs: []
  },

  {
    type: "function",
    name: "refund",
    stateMutability: "nonpayable",
    inputs: [{ name: "_id", type: "uint256" }],
    outputs: []
  },

  /* ───────── READ ───────── */

  {
    type: "function",
    name: "getCampaign",
    stateMutability: "view",
    inputs: [{ name: "_id", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "owner", type: "address" },
          { name: "title", type: "string" },
          { name: "description", type: "string" },
          { name: "target", type: "uint256" },
          { name: "deadline", type: "uint256" },
          { name: "amountCollected", type: "uint256" },
          // { name: "image", type: "string" },
          { name: "state", type: "uint8" }
        ]
      }
    ]
  },

  {
    type: "function",
    name: "campaigns",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "owner", type: "address" },
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      { name: "target", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "amountCollected", type: "uint256" },
      // { name: "image", type: "string" },
      { name: "state", type: "uint8" }
    ]
  },

  {
    type: "function",
    name: "contributions",
    stateMutability: "view",
    inputs: [
      { name: "", type: "uint256" },
      { name: "", type: "address" }
    ],
    outputs: [{ name: "", type: "uint256" }]
  },

  {
    type: "function",
    name: "numberOfCampaigns",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  }
] as const
