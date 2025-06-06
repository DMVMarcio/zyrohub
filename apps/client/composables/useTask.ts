import type { WorkerArgs, WorkerId, WorkerStorage } from '@zyrohub/toolkit';
import type { Task } from '~/shared/types';

export interface UseTaskOptions<T> {
	worker_id: T;
	clear_on_unmount?: boolean;
}

export const useTask = <T extends WorkerId>(options: UseTaskOptions<T>) => {
	const { $edenTasks } = useNuxtApp();

	const tasksStore = useTasksStore();
	const tasksStoreRefs = storeToRefs(tasksStore);

	const listener = useListener();

	const task = computed(
		() => tasksStoreRefs.tasks.value.find(task => task.worker_id === options.worker_id) as Task<T> | undefined
	);

	const isSubmittable = computed(() =>
		task.value ? !['pending', 'queued', 'running'].includes(task.value.status) : true
	);

	const start = async (data: WorkerArgs<T>, storage?: WorkerStorage<T>) => {
		const requestId = `${Date.now().toString()}-${Math.random().toString().slice(2)}`;

		if (task.value) {
			if (['pending', 'queued', 'running'].includes(task.value.status)) return;
			tasksStoreRefs.tasks.value.splice(
				tasksStoreRefs.tasks.value.findIndex(task => task.worker_id === options.worker_id),
				1
			);
		}

		tasksStoreRefs.tasks.value.push({
			request_id: requestId,
			worker_id: options.worker_id,
			status: 'pending',
			progress: { percentage: 0 },
			storage: storage,
			created_at: new Date()
		});

		$edenTasks.value?.send({
			name: 'task:start',
			content: {
				request_id: requestId,
				worker_id: options.worker_id,
				worker_data: data
			}
		});
	};

	const cancel = () => {
		if (!task.value) return;

		const requestId = `${Date.now().toString()}-${Math.random().toString().slice(2)}`;

		if (task.value.status !== 'pending')
			$edenTasks.value?.send({
				name: 'task:cancel',
				content: { request_id: requestId, worker_id: options.worker_id }
			});

		tasksStoreRefs.tasks.value.splice(
			tasksStoreRefs.tasks.value.findIndex(task => task.worker_id === options.worker_id),
			1
		);
	};

	const onTaskQueued = (callback: (data: Listeners<T>['task:queued']) => void) => {
		listener.listen('task:queued', listener_data => {
			if (listener_data.task.worker_id !== options.worker_id) return;

			callback(listener_data);
		});
	};

	const onTaskFinished = (callback: (data: Listeners<T>['task:finished']) => void) => {
		listener.listen('task:finished', listener_data => {
			if (listener_data.task.worker_id !== options.worker_id) return;

			callback(listener_data);
		});
	};

	const onTaskError = (callback: (data: Listeners<T>['task:error']) => void) => {
		listener.listen('task:error', listener_data => {
			if (listener_data.task.worker_id !== options.worker_id) return;

			callback(listener_data);
		});
	};

	onBeforeMount(() => {
		if (task.value && options.clear_on_unmount !== false) {
			tasksStoreRefs.tasks.value.splice(
				tasksStoreRefs.tasks.value.findIndex(task => task.worker_id === options.worker_id),
				1
			);
		}
	});

	return {
		task,
		worker_id: options.worker_id,

		isSubmittable,

		start,
		cancel,

		onTaskQueued,
		onTaskFinished,
		onTaskError
	};
};
