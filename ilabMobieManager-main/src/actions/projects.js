import { Toast } from '../components/Notification';
import restClient from '../config/axios';
import { mainTypes } from './types';
import { remote, scapeRegExp } from '../config/constants';

const filter = {
  cl_name: '',
  device: '',
  email: '',
  date_from: '',
  date_to: '',
};

export const projectSearch = (project, string) => {
  const regexp = new RegExp(scapeRegExp(string), 'i');
  const imei = new RegExp(string.replace(/\W/g, ''), 'i');
  return (
    project.name.search(regexp) >= 0 ||
    project.last_name.search(regexp) >= 0 ||
    project.device_name.search(regexp) >= 0 ||
    (project.dev_imei && project.dev_imei.search(imei) >= 0) ||
    (project.serial_number && project.serial_number.search(regexp) >= 0) ||
    (project.email && project.email.search(regexp) >= 0)
  );
};

export const getProjects = (params = filter) => (dispatch) =>
  restClient
    .getAxios()
    .post(remote.api, { tag: 'get_all_projects', params })
    .then(({ data }) => {
      dispatch({
        type: mainTypes.DATA_LOADED,
        payload: data.projects,
        key: 'projects',
      });
      return Promise.resolve(data.projects);
    })
    .catch((e) => Promise.reject(e));

export const getProject = (pr_id) => (/* dispatch */) =>
  restClient
    .getAxios()
    .post(remote.api, { tag: 'get_project_by_id', pr_id })
    .then((response) => Promise.resolve(response.data))
    .catch((error) => Promise.reject(error));

export const postProject = (project, updateAll = true) => (dispatch) =>
  restClient
    .getAxios()
    .post(remote.api, { tag: 'create_project', project })
    .then((response) => {
      if (updateAll) getProjects()(dispatch);
      Toast.showMessage('Projects', 'Add project: success');
      return Promise.resolve(response.data);
    })
    .catch((error) => Promise.reject(error));

export const postProjectUsedPart = (part) => (/* dispatch */) =>
  restClient
    .getAxios()
    .post(remote.api, { tag: 'add_used_parts', parts: [part] })
    .then((response) => Promise.resolve(response.data))
    .catch((error) => Promise.reject(error));

export const deleteProjectUsedPart = (part) => (/* dispatch */) => {
  const { part_id, pr_id, quantity } = part;

  return restClient
    .getAxios()
    .post(remote.api, {
      tag: 'delete_used_parts',
      part_id,
      pr_id,
      quantity,
    })
    .then((response) => Promise.resolve(response.data))
    .catch((error) => Promise.reject(error));
};

export const deleteProjectManyUsedPart = (project_id, parts) => () =>
  restClient
    .getAxios()
    .post(remote.api, { tag: 'delete_many_used_parts', project_id, parts })
    .then((response) => Promise.resolve(response.data))
    .catch((error) => Promise.reject(error));

export const getProjectUsedPart = (pr_id) => (/* dispatch */) =>
  restClient
    .getAxios()
    .post(remote.api, { tag: 'get_used_parts', pr_id })
    .then((response) => Promise.resolve(response.data))
    .catch((error) => Promise.reject(error));

export const updateProject = (project, updateAll = true) => (dispatch) =>
  restClient
    .getAxios()
    .post(remote.api, { tag: 'update_project', project })
    .then((response) => {
      if (updateAll) getProjects()(dispatch);
      Toast.showMessage('Projects', 'Update project: success');
      return Promise.resolve(response.data);
    })
    .catch((error) => Promise.reject(error));

export const projectInvoice = (project) => (dispatch) =>
  restClient
    .getAxios()
    .post(remote.api, { tag: 'project_invoice', project })
    .then((response) => {
      getProjects()(dispatch);

      return Promise.resolve(response.data);
    })
    .catch((error) => Promise.reject(error));

export const postProjectImage = (pr_id, image) => (/* dispatch */) =>
  restClient
    .getAxios()
    .post(`${remote.host}/saveImagePrj`, { pr_id, image })
    .then((response) => Promise.resolve(response.data))
    .catch((error) => Promise.reject(error));

export const postProjectSignatureImage = (pr_id, image) => (/* dispatch */) =>
  restClient
    .getAxios()
    .post(`${remote.host}/saveImageSignaturePrj`, { pr_id, image })
    .then((response) => Promise.resolve(response.data))
    .catch((error) => Promise.reject(error));

export const removeProjectImage = (id) => (/* dispatch */) =>
  restClient
    .getAxios()
    .post(remote.api, { tag: 'delete_pr_image', id })
    .then((response) => Promise.resolve(response.data))
    .catch((error) => Promise.reject(error));
