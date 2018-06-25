import {
    all,
    call,
    cancelled,
    put,
    select,
    takeEvery,
} from 'redux-saga/effects';
import {
    FETCH_CANCEL,
    FETCH_END,
    FETCH_ERROR,
    FETCH_START,
} from '../actions/fetchActions';

export function* handleFetch(dataProvider, action) {
    const {
        type,
        payload,
        meta: { fetch: fetchMeta, onSuccess, onFailure, ...meta },
    } = action;
    const restType = fetchMeta;

    try {
        const isOptimistic = yield select(state => state.admin.ui.optimistic);
        if (isOptimistic) {
            // in optimistic mode, all fetch actions are canceled,
            // so the admin uses the store without synchronization
            return;
        }

        yield all([
            put({ type: `${type}_LOADING`, payload, meta }),
            put({ type: FETCH_START }),
        ]);
        let response = yield call(
            dataProvider,
            restType,
            meta.resource,
            payload
        );
        if (!response.data) {
            throw new Error('REST response must contain a data key');
        }
        yield put({
            type: `${type}_SUCCESS`,
            payload: response,
            requestPayload: payload,
            meta: {
                ...meta,
                fetchResponse: restType,
                fetchStatus: FETCH_END,
            },
        });
        yield put({ type: FETCH_END });
        if (onSuccess) {
            if (Array.isArray(onSuccess)) {
                for (let index = 0; index < onSuccess.length; index++) {
                    yield put(onSuccess[index]);
                }
            } else {
                yield put(onSuccess);
            }
        }
    } catch (error) {
        yield put({
            type: `${type}_FAILURE`,
            error: error.message ? error.message : error,
            payload: error.body ? error.body : null,
            requestPayload: payload,
            meta: {
                ...meta,
                fetchResponse: restType,
                fetchStatus: FETCH_ERROR,
            },
        });
        yield put({ type: FETCH_ERROR, error });
        if (onFailure) {
            if (Array.isArray(onFailure)) {
                for (let index = 0; index < onFailure.length; index++) {
                    yield put(onFailure[index]);
                }
            } else {
                yield put(onFailure);
            }
        }
    } finally {
        if (yield cancelled()) {
            yield put({ type: FETCH_CANCEL });
            return; /* eslint no-unsafe-finally:0 */
        }
    }
}
export const takeFetchAction = action => action.meta && action.meta.fetch;
const fetch = dataProvider => {
    return function* watchFetch() {
        yield takeEvery(takeFetchAction, handleFetch, dataProvider);
    };
};

export default fetch;
