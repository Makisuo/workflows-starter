import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from "cloudflare:workers"

type Env = {
	FIRST_WORKFLOW: Workflow
	// SECOND_WORKFLOW: Workflow
}

// User-defined params passed to your workflow
type Params = {
	email: string
	metadata: Record<string, string>
}

export class FirstWorkflow extends WorkflowEntrypoint<Env, Params> {
	async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
		const files = await step.do("my first step", async () => {
			return {
				inputParams: event,
				files: [],
			}
		})

		const apiResponse = await step.do("some other step", async () => {
			const resp = await fetch("https://api.cloudflare.com/client/v4/ips")
			return await resp.json<any>()
		})
	}
}

// export class SecondWorkflow extends WorkflowEntrypoint<Env, Params> {
// 	async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
// 		const files = await step.do("some step", async () => {
// 			return {}
// 		})
// 	}
// }

export default {
	async fetch(req: Request, env: Env): Promise<Response> {
		const url = new URL(req.url)

		if (url.pathname.startsWith("/favicon")) {
			return Response.json({}, { status: 404 })
		}

		// Get the status of an existing instance, if provided
		const id = url.searchParams.get("")
		if (id) {
			const instance = await env.FIRST_WORKFLOW.get(id)
			return Response.json({
				status: await instance.status(),
			})
		}

		// Spawn a new instance and return the ID and status
		const instance = await env.FIRST_WORKFLOW.create({ id: "WOW2" })

		console.log(instance)
		return Response.json({
			id: instance.id,
			details: await instance.status(),
		})
	},
}
