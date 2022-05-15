import { Strategy } from "../lang-types/Strategy";

const scotty: Strategy = {
  config: {
    name: "JavaScript",
    author: "Joshua Hoeflich",
    license: "MIT",
    timeout: 300000,
    dependencies: {
      required: [
        {
          program: "node",
          check_output: {
            argument: "--version",
            includes: "16",
          },
        },
        { program: "git", check_output: null },
        {
          program: "scotty",
          check_output: {
            argument: "validate",
            includes: "Validation successful.",
          },
        },
      ],
    },
  },
  action: {
    steps: [
      {
        name: "Download the Source Code",
        uses: "Find",
        ecosystem: "npm",
        timeout: null,
      },
      {
        uses: "Run",
        name: "Install the Dependencies",
        run: "npm install --legacy-peerdeps",
        timeout: null,
      },
      {
        uses: "Run",
        name: "Run the Unit Tests",
        run: "npm test",
        timeout: null,
      },
      {
        uses: "Run",
        name: "Run the Unit Tests in Identity Mode",
        run: "scotty identity-mode && npm test",
        timeout: 180000,
      },
      {
        uses: "Run",
        name: "Run the Unit Tests in Proxy Mode",
        run: "scotty proxy-mode && npm test",
        timeout: 180000,
      },
      {
        uses: "Run",
        name: "Run the Unit Tests With Full Contract Checking",
        run: "scotty full-mode && npm test",
        timeout: 180000,
      },
    ],
    cleanup: [
      {
        uses: "Run",
        name: "Delete the package's source code",
        run: "rm -rf *",
        timeout: null,
      },
    ],
  },
};

export default scotty;
