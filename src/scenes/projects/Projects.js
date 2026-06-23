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
import {
  getProjectStatus, projectStatus, projectSortItems, projectFilterItems,
} from '../../config/constants';
import { getProjects, projectSearch } from '../../actions/projects';
import styles, { colors } from '../../config/styles';
import Scene from '../../components/Scene';
import TextInput, { TextInputIcon } from '../../components/TextInput';
import Header, { HeaderIcon } from '../components/Header';
import Filter from '../components/Filter';

class ProjectsScene extends Component {
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
      search: '',
    };
  }

  componentWillMount() {
    this.setState({ loading: true });
    this.props.getProjects()
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
    const { date_from, date_to } = this.state.params;
    const dueDate = item.due_date.split(' ')[0];
    if (date_to && dueDate > date_to) return false;
    if (date_from && dueDate < date_from) return false;
    return projectSearch(item, this.state.search);
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
    const { status } = this.state.params;
    let { projects } = this.props;
    projects = projects.filter(item => (status === projectStatus.OPEN
      ? item.status === projectStatus.OPEN || item.status === projectStatus.DELAYED
      : item.status === status));
    projects = projects.filter(this.projectFilter.bind(this));
    if (!this.state.params.sort) return projects;
    projects = projects.sort(this.projectSort.bind(this));
    return projects;
  }

  static renderProjectsListItem(project) {
    const status = getProjectStatus(project.status);
    return (
      <TouchableOpacity
        key={project.id}
        onPress={() => Actions.projectScene({ project })}
        style={styles.component.listItemButtonContainer}
      >
        <View>
          <Text style={[styles.component.listItemSubText, { color: status.color }]}>
            {I18n.t(status.name)}
          </Text>
          <Text style={styles.component.listItemMainText}>
            {project.name}
            {' '}
            {project.last_name}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.component.listItemSubText}>{project.due_date}</Text>
          <Text style={styles.component.listItemText}>
            {project.brand_name}
            {' '}
            {project.model_name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <Scene>
        <Header
          text={I18n.t('translation.projects')}
          left={HeaderIcon.MENU}
          right={HeaderIcon.ADD}
          additionRight={HeaderIcon.CART}
          onAdditionRightButtonPress={() => Actions.cartScene()}
          onLeftButtonPress={() => Actions.menuScene()}
          onRightButtonPress={() => Actions.projectFormsScene()}
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
            {projectFilterItems.map(status => (
              <TouchableOpacity
                key={status.id}
                onPress={() => this.handleFilterSubmit('status', status.id, true)}
              >
                <TextInput
                  editable={false} value={I18n.t(status.name)}
                  textStyle={{ flex: undefined, paddingHorizontal: 10, fontSize: 14 }}
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
                .map(project => ProjectsScene.renderProjectsListItem(project))
              }
            </View>
          </View>
        </ScrollView>
      </Scene>
    );
  }

  static propTypes = {
    projects: PropTypes.array.isRequired,
    getProjects: PropTypes.func.isRequired,
  }
}

export default connect(({ main }) => ({
  projects: main.projects,
}), {
  getProjects,
})(ProjectsScene);
