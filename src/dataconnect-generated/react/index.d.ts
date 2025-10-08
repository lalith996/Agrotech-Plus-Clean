import { CreateTaskData, ListTasksData, UpdateTaskData, UpdateTaskVariables, DeleteTaskData, DeleteTaskVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateTask(options?: useDataConnectMutationOptions<CreateTaskData, FirebaseError, void>): UseDataConnectMutationResult<CreateTaskData, undefined>;
export function useCreateTask(dc: DataConnect, options?: useDataConnectMutationOptions<CreateTaskData, FirebaseError, void>): UseDataConnectMutationResult<CreateTaskData, undefined>;

export function useListTasks(options?: useDataConnectQueryOptions<ListTasksData>): UseDataConnectQueryResult<ListTasksData, undefined>;
export function useListTasks(dc: DataConnect, options?: useDataConnectQueryOptions<ListTasksData>): UseDataConnectQueryResult<ListTasksData, undefined>;

export function useUpdateTask(options?: useDataConnectMutationOptions<UpdateTaskData, FirebaseError, UpdateTaskVariables>): UseDataConnectMutationResult<UpdateTaskData, UpdateTaskVariables>;
export function useUpdateTask(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateTaskData, FirebaseError, UpdateTaskVariables>): UseDataConnectMutationResult<UpdateTaskData, UpdateTaskVariables>;

export function useDeleteTask(options?: useDataConnectMutationOptions<DeleteTaskData, FirebaseError, DeleteTaskVariables>): UseDataConnectMutationResult<DeleteTaskData, DeleteTaskVariables>;
export function useDeleteTask(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteTaskData, FirebaseError, DeleteTaskVariables>): UseDataConnectMutationResult<DeleteTaskData, DeleteTaskVariables>;
