import React, { Component } from 'react';
import {
  Modal,
  Text,
  View,
  StyleSheet,
  TextInput,
  Button
} from 'react-native';
import {Agenda} from 'react-native-calendars';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from 'react-native-modal-datetime-picker';

export default class AgendaScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: {},
      dates: [],
      modalVisible: false,
      isDateTimePickerVisible: false,
      taskTime: null,
      taskLength: null,
      taskName: null
    };
    this.getMoviesFromApiAsync = this.getMoviesFromApiAsync.bind(this);
    this.addTask = this.addTask.bind(this);
  }

  // TODO: RENAME FUNC
  async getMoviesFromApiAsync() {
    return fetch('http://192.168.1.110:3000/')
      .then((response) => response.json())
      .then((responseJson) => {
        return responseJson.events;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  async componentDidMount() {
    let data = await this.getMoviesFromApiAsync();
    let dates = []
    data.map((calendars) => {
      calendars.map((events) => {
        if(events.start.dateTime && events.start.dateTime){
          console.log(events.start.dateTime)
          console.log(events.end.dateTime)
          const startDatetime = new Date(events.start.dateTime);
          const endDatetime = new Date(events.end.dateTime);

          //console.log(date.toISOString().split('T')[0])//.split('Z')[0]);

          // TODO: add an order fcn
          dates.push({
            startDate: startDatetime.toISOString().split('T')[0],
            endDate: endDatetime.toISOString().split('T')[0],
            startTime: this.format_time(startDatetime),//.split('T')[1].split(':00.000Z')[0],
            endTime: this.format_time(endDatetime),//.split('T')[1].split(':00.000Z')[0],
            title: events.summary
          });
        }
      })
    })
    this.setState({
      dates: dates
    })
    console.log(this.state.dates)
  }

  /**
   * HELPER FUNCTIONS
   */
  _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });

  _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });

  _handleDatePicked = (date) => {
    this.setState({ taskTime: date })
    this._hideDateTimePicker();
  };

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  displayTaskTime() {
    if(this.state.taskTime!==null){
      return this.format_dateTime(this.state.taskTime);
    }
  }

  addTask() {
    console.log("TEST")

    let errMsg = null

    if(this.state.taskLength===null)
      errMsg = "A Task Length must be set!"

    if(this.state.taskTime===null)
      errMsg = "A Due Date must be chosen!"

    if(this.state.taskName===null)
      errMsg = "A Task Name must be chosen!"

    // success
    if(errMsg === null){
      return fetch('http://192.168.1.110:3000/add', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskTime: this.state.taskTime,
          taskLength: this.state.taskLength,
          taskName: this.state.taskName
        }),
      }).then(() => {
        this.setModalVisible(false);
        alert("Task successfully added to the server and Google Calendar")
        this.setState({
          taskTime: null,
          taskLength: null,
          taskName: null
        })
        
      })


    }

    // error
    else{
      alert(errMsg)
    }

    // TODO: Make it reset after adding logic, instead of everytime opening
    // this.setState({ 
    //   taskLength: null,
    //   taskTime: null
    // })
  }

  onChanged(text){
    let newText = '';
    let characters = '0123456789.';

    for (var i=0; i < text.length; i++) {
        if(characters.indexOf(text[i]) > -1 ) {
            newText = newText + text[i];
        }
        else {
            alert("Please enter numbers only");
        }
    }
    this.setState({ taskLength: newText });
  }

  render() {
    return (
      <View style={{flex:1, backgroundColor: '#f3f3f3'}}>
        <Modal
          animationType="fade"
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setState({modalVisible: false});
          }}>
        
          <View style={{ flex: 1 }}>
            <View style={styles.MainContainer}>
              <Text style= {{ fontSize: 48, color: "#000", textAlign: 'center', marginBottom: 45 }}>Add a Task</Text>

              <TextInput
                // Adding hint in Text Input using Place holder.
                placeholder="Enter Task Name"
                onChangeText={taskName => this.setState({taskName})}
                // Making the Under line Transparent.
                underlineColorAndroid='transparent'
                style={styles.TextInputStyleClass}
              />

              <View style= {{marginTop: 10, marginBottom: 10}}>
                <Button title="Set Due Date" onPress={this._showDateTimePicker} color="#2196F3" />
              </View>
              <Text style= {{ fontSize: 16, color: "#000", textAlign: 'center', marginBottom: 20 }}>{this.displayTaskTime()}</Text>

              <TextInput
                placeholder="Task Length in Hours"
                style={styles.textInput}
                keyboardType='numeric'
                onChangeText={(text)=> this.onChanged(text)}
                value={this.state.myNumber}
                maxLength={6}  //setting limit of input
                style={styles.TextInputStyleClass}
              />
              <View style= {{marginTop: 40}}>
                <Button title="Add Task" onPress={this.addTask} color="#2196F3" />
              </View>
            </View>

            <DateTimePicker
              mode="datetime"
              is24Hour={false}
              isVisible={this.state.isDateTimePickerVisible}
              onConfirm={this._handleDatePicked}
              onCancel={this._hideDateTimePicker}
            />
         </View> 

        </Modal>
        <Agenda
          items={this.state.items}
          loadItemsForMonth={this.loadItems.bind(this)}
          selected={new Date()}
          renderItem={this.renderItem.bind(this)}
          renderEmptyDate={this.renderEmptyDate.bind(this)}
          rowHasChanged={this.rowHasChanged.bind(this)}
          // markingType={'period'}
          // markedDates={{
          //    '2017-05-08': {textColor: '#666'},
          //    '2017-05-09': {textColor: '#666'},
          //    '2017-05-14': {startingDay: true, endingDay: true, color: 'blue'},
          //    '2017-05-21': {startingDay: true, color: 'blue'},
          //    '2017-05-22': {endingDay: true, color: 'gray'},
          //    '2017-05-24': {startingDay: true, color: 'gray'},
          //    '2017-05-25': {color: 'gray'},
          //    '2017-05-26': {endingDay: true, color: 'gray'}}}
          // monthFormat={'yyyy'}
          //  theme={{
          //   agendaDayTextColor: 'yellow',
          //   agendaDayNumColor: 'green',
          //   agendaTodayColor: 'red',
          //   agendaKnobColor: 'blue'
          // }}
          //renderDay={(day, item) => (<Text>{day ? day.day: 'item'}</Text>)}
        />
        <ActionButton
          buttonColor="rgba(231,76,60,1)"
          onPress={() => { this.setModalVisible(!this.state.modalVisible) }}
        />
      </View>
    );
  }

  loadItems(day) {
    setTimeout(() => {
      for (let i = -15; i < 85; i++) {
        const time = day.timestamp + i * 24 * 60 * 60 * 1000;
        const strTime = this.dateToString(time);
        if (!this.state.items[strTime]) {
          this.state.items[strTime] = [];
          //const numItems = Math.floor(Math.random() * 5);
          for (let j = 0; j < this.state.dates.length; j++) {
            if(this.state.dates[j].startDate == strTime){ //TODO: needs to be changed later
              this.state.items[strTime].push({
                name: this.state.dates[j].title,
                startTime: this.state.dates[j].startTime,
                endTime: this.state.dates[j].endTime,
                height: 100
              });
            }
          }
        }
      }

      //console.log(this.state.items);
      const newItems = {};
      Object.keys(this.state.items).forEach(key => {newItems[key] = this.state.items[key];});
      this.setState({
        items: newItems
      });
    }, 3000);
    // console.log(`Load Items for ${day.year}-${day.month}`);
  }

  renderItem(item) {
    return (
      <View style={[styles.item, {height: item.height}]}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.time}>{item.startTime} - {item.endTime}</Text>
        <Text style={styles.location}>{item.name}</Text>
      </View>
    );
  }

  renderEmptyDate() {
    return (
      <View style={styles.emptyDate}>
        {/* <Text>This is empty date!</Text> */}
      </View>
    );
  }

  rowHasChanged(r1, r2) {
    return r1.name !== r2.name;
  }

  format_time(date_obj) {
    // formats a javascript Date object into a 12h AM/PM time string
    var hour = date_obj.getHours();
    var minute = date_obj.getMinutes();
    var amPM = (hour > 11) ? "pm" : "am";
    if(hour > 12) {
      hour -= 12;
    } else if(hour == 0) {
      hour = "12";
    }
    if(minute < 10) {
      minute = "0" + minute;
    }
    return hour + ":" + minute + amPM;
  }

  format_dateTime(date_obj) {
    // TODO: Change to text date & show day of week
    // formats a javascript Date object into a 12h AM/PM time string
    var hour = date_obj.getHours();
    var minute = date_obj.getMinutes();
    var amPM = (hour > 11) ? "PM" : "AM";
    if(hour > 12) {
      hour -= 12;
    } else if(hour == 0) {
      hour = "12";
    }
    if(minute < 10) {
      minute = "0" + minute;
    }
    return date_obj.getMonth() + "/" + date_obj.getDate() + "/" + date_obj.getFullYear() + " at " + hour + ":" + minute + " " + amPM;
  }

  timeToString(time) {
    const date = new Date(time);
    return date.toUTCString().split('T')[1];
  }

  dateToString(time) {
    const date = new Date(time);
    return date.toISOString().split('T')[0];
  }
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  time: {
    color: '#00adf5'
  },
  location: {

  },
  emptyDate: {
    height: 15,
    flex:1,
    paddingTop: 30
  },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white',
  },
  MainContainer :{

    justifyContent: 'center',
    flex:1,
    margin: 10
  },
     
  TextInputStyleClass: {
    textAlign: 'center',
    marginBottom: 15,
    height: 40,
    borderWidth: 1,
    // Set border Hex Color Code Here.
     borderColor: '#2196F3',
     
     // Set border Radius.
     borderRadius: 5 ,
     
    // Set border Radius.
     //borderRadius: 10 ,
  }
});
