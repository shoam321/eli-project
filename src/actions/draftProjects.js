import restClient from '../config/axios';
import { remote, scapeRegExp } from '../config/constants';
import { mainTypes } from './types';

export const draftProjectSearch = (project, string) => {
  const regexp = new RegExp(scapeRegExp(string), 'i');
  return project.user.name.search(regexp) >= 0
    || project.user.last_name.search(regexp) >= 0
    || (project.is_temp_device === 1 && project.draft_device && project.draft_device.brand && project.draft_device.brand.name.search(regexp) >= 0)
    || (project.is_temp_device === 1 && project.draft_device && project.draft_device.model && project.draft_device.model.m_name.search(regexp) >= 0)
    || (project.is_temp_device === 0 && project.device && project.device.brand && project.device.brand.name.search(regexp) >= 0)
    || (project.is_temp_device === 0 && project.device && project.device.model && project.device.model.m_name.search(regexp) >= 0)
    || (project.user.email && project.user.email.search(regexp) >= 0);
};

export const getDraftProjects = () => dispatch => restClient.getAxios().post(remote.api, { tag: 'get_temp_projects' })
  .then(({ data }) => {
    dispatch({ type: mainTypes.DATA_LOADED, payload: data.projects, key: 'draftProjects' });
    return Promise.resolve(data.projects);
  })
  .catch(e => Promise.reject(e));

export const deleteDraftProject = id => dispatch => restClient.getAxios().post(remote.api, { tag: 'delete_temp_project', id })
  .then(() => {
    getDraftProjects()(dispatch);
    return Promise.resolve(true);
  })
  .catch(e => Promise.reject(e));
