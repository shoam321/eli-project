import React, { Component } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl, Platform,
} from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';

import I18n from '../../lang/i18n';
import { projectStatusItems, projectSortItems } from '../../config/constants';
import { getDraftProjects, draftProjectSearch } from '../../actions/draftProjects';
import styles, { colors } from '../../config/styles';
import Scene from '../../components/Scene';
import TextInput, { TextInputIcon } from '../../components/TextInput';
import Header, { HeaderIcon } from '../components/Header';
import Filter from '../components/Filter';

class DraftProjectsScene extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filter: false,
      datePicker: false,
      params: {
        status: 1,
        date_from: '',
        date_to: '',
        sort: '',
      },
      loading: false,
      // search: '',
    };
  }

  componentWillMount() {
    this.setState({ loading: true });
    this.props.getDraftProjects()
      .finally(() => this.setState({ loading: false }));
  }

  handleDatePick(date) {
    this.setState({
      datePicker: false,
      params: {
        ...this.state.params,
        [this.state.datePicker]: moment(date).format('YYYY-MM-DD'),
      },
    }, () => {
      // Fix iOS bug. Can't open multiple modals.
      // https://github.com/react-native-community/react-native-modal/issues/30
      setTimeout(() => {
        this.setState({
          filter: true,
        });
      }, Platform.OS === 'ios' ? 400 : 0);
    });
  }

  handleFilterSubmit(key, value, check) {
    this.setState({
      params: {
        ...this.state.params,
        [key]: (this.state.params[key] === value && check) ? 0 : value,
      },
    });
  }

  projectFilter(item) {
    return draftProjectSearch(item, this.state.search);
  }

  projectSort(a, b) {
    const key = this.state.params.sort;
    if (a[key] < b[key]) return -1;
    else if (a[key] > b[key]) return 1;
    else return 0;
  }

  getFilterIconColor() {
    const {
      status, date_from, date_to, sort,
    } = this.state.params;
    if (status || date_from || date_to || sort) return colors.button;
    return colors.blackBackground;
  }

  getProjectList() {
    let { draftProjects } = this.props;
    draftProjects = draftProjects.filter(this.projectFilter.bind(this));
    return draftProjects;
  }

  static renderProjectsListItem(project) {
    return (
      <TouchableOpacity
        key={project.id}
        onPress={() => {
          if (project.is_temp_device === 1) {
            Actions.deviceFormsScene({
              draftProjectId: project.id,
              client: project.user,
              brand: project.draft_device.brand,
              model: project.draft_device.model,
              device: {
                dev_imei: project.draft_device.imei,
                serial_number: project.draft_device.serial_number,
                dev_pass: project.draft_device.device_password,
                scr_pass: project.draft_device.screen_password,
                device_name: project.draft_device.name,
              },
              problem: project.problem,
              onActionsSuccess: (data) => {
                Actions.projectFormsScene({
                  draftProjectId: data.id,
                  isTemporaryDevice: true,
                  isTemporaryProject: true,
                  client: data.user,
                  clientDevice: {
                    ...data.device,
                  },
                  project: {
                    problem: data.problem,
                    signature_image: project.signature_image,
                  },
                  onActionsSuccess: () => {
                    Actions.popTo('draftProjectsScene');
                  },
                });
              },
            });
          } else {
            Actions.projectFormsScene({
              draftProjectId: project.id,
              isTemporaryProject: true,
              client: project.user,
              clientDevice: {
                ...project.device,
                brand_name: project.device.brand && project.device.brand.name,
                model_name: project.device.model && project.device.model.m_name,
              },
              project: {
                problem: project.problem,
                signature_image: project.signature_image,
              },
              onActionsSuccess: () => {
                Actions.popTo('draftProjectsScene');
              },
            });
          }
        }}
        style={styles.component.listItemButtonContainer}
      >
        <View>
          <Text style={styles.component.listItemMainText}>
            {project.user.name}
            {' '}
            {project.user.last_name}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.component.listItemText}>
            {project.is_temp_device === 1 && project.draft_device && project.draft_device.brand ? `${project.draft_device.brand.name} ` : ''}
            {project.is_temp_device === 1 && project.draft_device && project.draft_device.model ? `${project.draft_device.model.m_name} ` : ''}
            {project.is_temp_device === 0 && project.device && project.device.brand ? `${project.device.brand.name} ` : ''}
            {project.is_temp_device === 0 && project.device && project.device.model ? `${project.device.model.m_name} ` : ''}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <Scene>
        <Header
          text={I18n.t('translation.draftProjects')}
          left={HeaderIcon.MENU}
          onLeftButtonPress={() => Actions.menuScene()}
        />
        <View style={styles.scene.responsiveWrapper}>
          <View style={styles.scene.responsive}>
            <TextInput
              placeholder={I18n.t('translation.clientDeviceEmail')}
              onChangeText={search => this.setState({ search })}
              left={<TextInputIcon.Search />}
              right={<TextInputIcon.Filter color={this.getFilterIconColor()} />}
              onRightButtonPress={() => this.setState({ filter: true })}
              containerStyle={styles.scene.searchInputContainer}
            />
          </View>
        </View>

        <DateTimePicker
          key="datepicker"
          isVisible={!!this.state.datePicker}
          onConfirm={date => this.handleDatePick(date)}
          onCancel={() => this.setState({ datePicker: false, filter: true })}
        />

        <Filter
          title={I18n.t('translation.projectFilter')}
          key="filter"
          visible={this.state.filter}
          onResetFilter={() => this.setState({ params: {} })}
          onRequestClose={() => this.setState({ filter: false })}
        >
          <View style={styles.component.filterRow}>
            <TouchableOpacity
              style={{ flex: 1, marginRight: 5 }}
              onPress={() => this.setState({ datePicker: 'date_from', filter: false })}
            >
              <TextInput
                editable={false}
                placeholder={I18n.t('translation.dateFrom')}
                textStyle={{ paddingHorizontal: 10 }}
                value={this.state.params.date_from}
                right={<TextInputIcon.Calendar />}
                onRightButtonPress={() => this.setState({ datePicker: 'date_from', filter: false })}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, marginLeft: 5 }}
              onPress={() => this.setState({ datePicker: 'date_to', filter: false })}
            >
              <TextInput
                editable={false}
                placeholder={I18n.t('translation.dateTo')}
                textStyle={{ paddingHorizontal: 10 }}
                value={this.state.params.date_to}
                right={<TextInputIcon.Calendar />}
                onRightButtonPress={() => this.setState({ datePicker: 'date_to', filter: false })}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.component.filterRow}>
            {projectStatusItems.map(status => (
              <TouchableOpacity
                key={status.id}
                onPress={() => this.handleFilterSubmit('status', status.id, true)}
              >
                <TextInput
                  editable={false} value={I18n.t(status.name)}
                  textStyle={{ flex: undefined, paddingHorizontal: 10 }}
                  containerStyle={{
                    borderBottomWidth: 2,
                    borderColor: this.state.params.status === status.id
                      ? colors.button : colors.lightGray,
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.component.filterRow}>
            {projectSortItems.map(sort => (
              <TouchableOpacity
                key={sort.id}
                onPress={() => this.handleFilterSubmit('sort', sort.key, true)}
              >
                <TextInput
                  editable={false} value={I18n.t(sort.name)}
                  textStyle={{ flex: undefined, paddingHorizontal: 10 }}
                  containerStyle={{
                    borderBottomWidth: 2,
                    borderColor: this.state.params.sort === sort.key
                      ? colors.button : colors.lightGray,
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </Filter>

        <ScrollView
          contentContainerStyle={styles.scene.listItemsContainer}
          refreshControl={(
            <RefreshControl
              refreshing={this.state.loading}
              onRefresh={this.componentWillMount.bind(this)}
            />
)}
        >
          <View style={styles.scene.responsiveWrapper}>
            <View style={styles.scene.responsive}>
              {this.getProjectList()
                .map(project => DraftProjectsScene.renderProjectsListItem(project))
              }
            </View>
          </View>
        </ScrollView>
      </Scene>
    );
  }

  static propTypes = {
    draftProjects: PropTypes.array.isRequired,
    getDraftProjects: PropTypes.func.isRequired,
  }
}

export default connect(({ main }) => ({
  draftProjects: main.draftProjects,
}), {
  getDraftProjects,
})(DraftProjectsScene);
