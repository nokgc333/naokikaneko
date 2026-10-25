const BASE = "http://localhost:3400";

module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm run start -- -p 3400",
      startServerReadyPattern: "Ready",
      url: [
        `${BASE}/`,
        `${BASE}/about`,
        `${BASE}/blog`,
        `${BASE}/blog/mdx-markdown-differences`,
        `${BASE}/work/naokikaneko-com`,
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertMatrix: [
        {
          matchingUrlPattern: "^http://localhost:3400/$",
          assertions: {
            "categories:performance": ["error", { minScore: 0.9 }],
            "largest-contentful-paint": ["error", { maxNumericValue: 2800 }],
            "resource-summary:script:size": ["error", { maxNumericValue: 195000 }],
            "resource-summary:total:size": ["error", { maxNumericValue: 410000 }],
          },
        },
        {
          matchingUrlPattern: "^http://localhost:3400/.+",
          assertions: {
            "categories:performance": ["error", { minScore: 0.75 }],
            "largest-contentful-paint": ["error", { maxNumericValue: 5000 }],
            "resource-summary:script:size": ["error", { maxNumericValue: 195000 }],
            "resource-summary:total:size": ["error", { maxNumericValue: 1400000 }],
          },
        },
        {
          matchingUrlPattern: ".*",
          assertions: {
            "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
            "total-blocking-time": ["error", { maxNumericValue: 200 }],
          },
        },
      ],
    },
    upload: { target: "filesystem", outputDir: ".lighthouseci" },
  },
};
