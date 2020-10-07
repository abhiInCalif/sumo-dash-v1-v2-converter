# Intro
The purpose of this project is to provide an unsupported conversion method from v1 to v2 dashboards for Sumo Logic. This is NOT SUPPORTED and provides NO GUARANTEES of correctness. In fact, its not even officially released by Sumo Logic, and is done entirely as a self-standing experiment.

## Contribution Instructions
I've been following a TDD (test-driven-development) structure to this repo. In otherwords, please write the test case first, provide the test files, and push that in a separate commit before pushing the code to make the test work. Reviewing the test is a pre-requisite to reviewing the code changes.

To setup this repo, you just need to check out the code base and run `yarn` in the root directory. If you do not have `yarn` installed on your computer and you are running a mac, you can get `yarn` by running `brew install yarn` (https://classic.yarnpkg.com/en/docs/install/#mac-stable). Once you have `yarn` you can just run `yarn` in the root and you should have all the dependencies.

To run the project, run `yarn run run`. To run the tests run `yarn run test`

## Running against Classic Dashboard JSONs
If you want to convert a dashboard from classic to dashboard (new), run `yarn convert <filePath>`. `filePath` should a classic dashboard json.  It will spit out the new dashboard json assuming the underlying support code has been written.
