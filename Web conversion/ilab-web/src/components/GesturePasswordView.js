import React, { Component } from 'react';
import { View, Text } from 'react-native';
import PropTypes from 'prop-types';
import styles from '../config/styles';

class GesturePasswordView extends Component {
  componentWillMount() {
    // Code
  }

  render() {
    const thumbnail = [
      {
        key: 1,
        data: [
          { value: 1, active: false, item: '' },
          { value: 2, active: false, item: '' },
          { value: 3, active: false, item: '' },
        ],
      },
      {
        key: 2,
        data: [
          { value: 4, active: false, item: '' },
          { value: 5, active: false, item: '' },
          { value: 6, active: false, item: '' },
        ],
      },
      {
        key: 3,
        data: [
          { value: 7, active: false, item: '' },
          { value: 8, active: false, item: '' },
          { value: 9, active: false, item: '' },
        ],
      },
    ];

    this.props.value.split('').forEach((passwordItem, index) => {
      thumbnail.forEach(row => row.data.forEach((item) => {
        if (Number(passwordItem) === item.value) {
          item.active = true;
          item.item = index + 1;
        }
      }));
    });

    return (
      <View style={styles.component.thumbnailPasswordMain}>
        <Text style={styles.component.thumbnailPasswordHintText}>
          { this.props.placeholder }
        </Text>
        <View style={styles.component.thumbnailPasswordContainer}>
          {
            thumbnail.map(row => (
              <View
                key={row.key}
                style={styles.component.thumbnailPasswordItems}
              >
                {
                  row.data.map(item => (
                    <View
                      key={item.value}
                      style={[styles.component.thumbnailPasswordItem, item.active ? styles.component.thumbnailPasswordItemActive : {}]}
                    >
                      <Text style={styles.component.thumbnailPasswordItemText}>{ item.item }</Text>
                    </View>
                  ))
                }
              </View>
            ))
          }
        </View>
      </View>
    );
  }

  static propTypes = {
    value: PropTypes.string,
    placeholder: PropTypes.string,
  };

  static defaultProps = {
    value: '',
    placeholder: '',
  };
}

export default GesturePasswordView;
