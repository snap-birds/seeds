const core = require('@actions/core');
const github = require('@actions/github');
// const { PubSub } = require('@google-cloud/pubsub');

const stepsErrors = new Array(
  {id: "req_generate#(failure|skipped)", error: 'HANDLE_TEMPLATE_ERROR', context: ["run_id:runId", "repository_url:repository.html_url"]},
  {id: "req_create_pr_check#(failure|skipped)", error: 'HANDLE_UNCHANGED_ERROR', context: ["run_id:runId", "repository_url:repository.html_url"]},
  {id: "req_create_pr#(failure|skipped)", error: 'HANDLE_CREATE_PR_ERROR', context: ["run_id:runId", "repository_url:repository.html_url"]},
  {id: "req_create_pr#success", error: 'HANDLE_SUCCESS', context: ["run_id:runId", "pull_request_url:pull-request-url", "repository_url:repository.html_url"]},
  {id: "proc_close_pr#failure", error: 'PROCESS_CLOSE_PR_ERROR', context: ["run_id:runId", "pull_request_url:pull_request.issue_url", "repository_url:repository.html_url"]},
  {id: "proc_close_pr#success", error: 'PROCESS_SUCCESS', context: ["run_id:runId", "pull_request_url:pull_request.issue_url", "repository_url:repository.html_url"]},
  {id: "plan#failure", error: 'PROVISION_VALIDATE_ERROR', context: ["run_id:runId", "pull_request_url:pull_request.issue_url", "repository_url:repository.html_url", "details:stderr"]},
  {id: "apply#failure", error: 'PROVISION_APPLY_ERROR', context: ["run_id:runId", "pull_request_url:pull_request.issue_url", "repository_url:repository.html_url", "details:stderr"]},
  {id: "apply#success", error: 'PROVISION_SUCCESS', context: ["run_id:runId", "pull_request_url:pull_request.issue_url", "repository_url:repository.html_url"]},
);

const getValue = (path, obj) => path.split('.').reduce((acc, c) => acc && acc[c], obj);

async function main() {
  const inputSteps = new Map(Object.entries(JSON.parse(core.getInput('steps', {required: true}))));
  const inputMessage = new Map(Object.entries(JSON.parse(core.getInput('message', {required: true}))))

  let message = Object();
  let step = Object();

  for (let i = 0, len = stepsErrors.length; i < len; i++) {
    let [stepError, stepErrorStatus] = stepsErrors[i].id.split('#');

    if (inputSteps.has(stepError)) {
      step = inputSteps.get(stepError);
      if (step.outcome.match(stepErrorStatus)) {
        message = {
          status: stepsErrors[i].error,
          context: Object.fromEntries(stepsErrors[i].context.map(ctx => {
            const ctx_name = ctx.split(':')[0];
            const ctx_path = ctx.split(':')[1] ?? ctx_name;

            return [ctx_name, (getValue(ctx_path, step.outputs) ?? getValue(ctx_path, github.context) ?? getValue(ctx_path, github.context.payload) ?? '')]
          }))
        };
        break;
      }
    }
  }
  inputMessage["pipeline_status"] = message;
  console.log(inputMessage);
  console.log(github.context)

  // Pubsub logic
}

main().catch((err) => {
  console.error(err);
  core.setFailed(err.message);
});
