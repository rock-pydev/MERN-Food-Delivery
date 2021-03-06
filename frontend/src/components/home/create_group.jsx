import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faUserPlus, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import HomeSearch from './home_search';
import HomeSideMap from './home_side_map';
import _ from 'lodash';
import './create_group.css'
import "balloon-css";

class CreateGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      groupName: "",
      startTime: "",
      endTime: "",
      users: Object.values(this.props.users),
      selectedFoodRestrictions: [],
      foodRestrictions: [],
      monetaryRestriction: "",
      isSplit: true,
      userSearch: "",
      candidates: [],
      addUsers: []
    };

    this.moneySelect = this.moneySelect.bind(this);
    this.moneyHandle = this.moneyHandle.bind(this);
    this.handleTextChange = this.handleTextChange.bind(this);
    this.candidateSelected = this.candidateSelected.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.removeUser = this.removeUser.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleRandomSubmit = this.handleRandomSubmit.bind(this);
  }

  componentDidUpdate() {
    if (this.errorUl != undefined) {
      this.errorUl.scrollIntoView({ 
        behavior: 'smooth' 
      });
    }
  }

  handleTextChange(e) {
    const value = e.target.value;
    let candidates = [];
    if (value.charCodeAt(0) === 92) return null;

    if (value.length > 0) {
      const regex = new RegExp(`${value}`, "i");
      candidates = this.state.users.filter(
        user =>
          (regex.test(user.username) || regex.test(user.email)) &&
          user._id !== this.props.user.id
      );
    }

    this.setState({
      candidates,
      userSearch: value
    });
  }

  moneyHandle(e) {
    e.preventDefault();
    if (this.listBox.classList.contains("list-box-click")) {
      this.listBox.classList.remove("list-box-click");
    } else {
      this.listBox.classList.add("list-box-click");
      this.listBox.scrollIntoView({
        behavior: 'smooth'
      });
    }
  }

  moneySelect(e) {
    this.setState({ monetaryRestriction: e.target.value });
  }

  handleSubmit(e) {
    e.preventDefault();
    const likedBusinesses = _.mapValues(this.props.businesses, () => []);
    const dislikedBusinesses = _.mapValues(this.props.businesses, () => []);
    const creator = this.props.user.id;

    const newGroup = {
      groupName: this.state.groupName,
      startTime: new Date(),
      endTime: new Date(this.state.endTime),
      users: [...this.state.addUsers, this.props.user.id],
      foodRestrictions: this.state.foodRestrictions,
      monetaryRestriction: this.state.monetaryRestriction,
      isSplit: this.state.isSplit,
      businesses: Object.keys(this.props.businesses),
      likedBusinesses,
      dislikedBusinesses,
      creator
    };
    
    this.props.clearUpData();
    this.props.createGroup(newGroup).then(res => {
      if (res.type === "RECEIVE_GROUP_ERRORS") {
        return null;
      } else if (res.type === "RECEIVE_GROUP") {
        return this.props.history.push(`/swipe/${res.group._id}`);
      }
    })
  }

  handleRandomSubmit(e){
    e.preventDefault();

    const likedBusinesses = _.mapValues(this.props.businesses, () => []);
    const dislikedBusinesses = _.mapValues(this.props.businesses, () => []);
    const creator = this.props.user.id;
    
    const groupNames = ["A Team", "All Stars", "Amigos", "Avengers", "Bannermen", "Best of the Best", "Bosses", "Champions", "Crew", "Dominators", "Dream Team", "Elite", "Force", "Goal Diggers", "Heatwave", "Hot Shots", "Hustle", "Icons", "Justice League", "Legends", "Lightning", "Maniacs", "Masters", "Monarchy", "Naturals", "Ninjas", "Outliers", "Peak Performers", "Power", "Rebels", "Revolution", "Ringmasters", "Rule Breakers", "Shakedown", "Squad", "Titans", "Tribe", "United", "Vikings", "Warriors", "Wolf Pack"];

    const userIds = Object.keys(this.props.users);
    const usersCandidateIds = userIds.slice(0, Math.floor(Math.random() * userIds.length) + 1).filter(user => user._id !== this.props.user.id);

    const speed = 100;
    const curGroupNames = groupNames[Math.floor(Math.random() * groupNames.length)];

    if (this.state.groupName !== curGroupNames) {
      const inputGroupName = setInterval(() => {
        if (this.state.groupName !== curGroupNames) {
          const temp = curGroupNames.slice(0, this.state.groupName.length + 1);
          this.setState({ groupName: temp });
        } else {
          clearInterval(inputGroupName);
          animateAddUser();
        }
      }, speed);
    } 

    const curUsers = [this.props.user.id, ...usersCandidateIds];

    const animateAddUser = () => {
      const inputAddUser = setInterval(async () => {
        if (this.state.addUsers.length !== curUsers.length) {
          await this.setState({ addUsers: curUsers.slice(0, this.state.addUsers.length + 1) })
          const {foodRestrictions, selectedFoodRestrictions} = this.updateFoodRestrictions(this.state.addUsers);
          await this.setState({ selectedFoodRestrictions: selectedFoodRestrictions });
          await this.setState({ foodRestrictions: foodRestrictions });
        } else {
          clearInterval(inputAddUser);
          animateEndTime();
        }
      }, speed);
    }

    const animateEndTime = () => {
      let curTimes = new Date(new Date().getTime() + (60 * 24 * 30 * 60000));
      let curYear = curTimes.getFullYear().toString();
      let curMonth = curTimes.getMonth().toString();
      let curDate = curTimes.getDate().toString();
      let curHours = curTimes.getHours().toString();
      let curMinutes = curTimes.getMinutes().toString();
      if (curMonth.length === 1) curMonth = `0${curMonth}`;
      if (curDate.length === 1) curDate = `0${curDate}`;
      if (curHours.length === 1) curHours = `0${curHours}`;
      if (curMinutes.length === 1) curMinutes = `0${curMinutes}`;
      const timeString = `${curYear}-${curMonth}-${curDate}T${curHours}:${curMinutes}`

      const inputEndTime = setInterval(async () => {
        await this.setState({ endTime: timeString })
        clearInterval(inputEndTime);
        runAnimation()
      }, speed);
    }

    const runAnimation = () => {
      const newGroup = {
       groupName: this.state.groupName,
       startTime: new Date(),
       endTime: this.state.endTime,
       users: this.state.addUsers,
       foodRestrictions: this.state.foodRestrictions,
       monetaryRestriction: ["$", "$$", "$$$", "$$$$"][Math.floor(Math.random() * 4)],
       isSplit: this.state.isSplit,
       businesses: Object.keys(this.props.businesses),
       likedBusinesses,
       dislikedBusinesses,
       creator
     };
 
     this.props.createGroup(newGroup).then(res => {
       if (res.type === "RECEIVE_GROUP_ERRORS") {
         return null;
       } else if (res.type === "RECEIVE_GROUP") {
         return this.props.history.push(`/swipe/${res.group._id}`);
       }
     })
    }
  };

  handleChange(type) {
    let that = this;
    return function(e) {
      console.log(e.target.value,"endTime");
      if (type === "groupName") {
        that.setState({ groupName: e.target.value });
      } else if (type === "endTime") {
        that.setState({ endTime: e.target.value });
      } else if (type === "monetary-restriction") {
        that.setState({ monetaryRestriction: e.target.value });
      } else if (type === "isSplit") {
        let isSplit;
        if (that.state.isSplit === true) {
          isSplit = false;
        } else {
          isSplit = true;
        }
        that.setState({ isSplit: isSplit });
      }
    };
  }

  renderCandidates() {
    const { candidates } = this.state;
    if (candidates.length === 0) return null;
    return (
      <div className="auto-complete-users-container">
        {candidates.slice(0, 5).map((user, idx) => {
          return (
            <div
              className="auto-complete-user"
              onClick={this.candidateSelected}
              key={idx}
              value={user._id}
            >
              <img src="profile-icon.png" />
              <span>{user.username}</span>
              <span>( {user.email} )</span>
            </div>
          );
        })}
      </div>
    );
  }

  updateFoodRestrictions(userIds) {
    let foodRestrictions = [];
    let selectedFoodRestrictions = [];
    for (let i = 0; i < userIds.length; i++) {
      let frArr = this.props.users[userIds[i]].foodRestriction;
      for (let j = 0; j < frArr.length; j++) {
        if (!selectedFoodRestrictions.includes(frArr[j].restriction)) {
          foodRestrictions.push(frArr[j]._id);
          selectedFoodRestrictions.push(frArr[j].restriction);
        }
      }
    }
    return {
      foodRestrictions,
      selectedFoodRestrictions
    };
  }

  candidateSelected(e) {
    const curVal = e.currentTarget.getAttribute("value");
    let addUsers;
    if (!this.state.addUsers.includes(curVal)) {
      addUsers = [
        ...this.state.addUsers,
        e.currentTarget.getAttribute("value")
      ];
    } else {
      addUsers = this.state.addUsers;
    }

    const {
      foodRestrictions,
      selectedFoodRestrictions
    } = this.updateFoodRestrictions(addUsers);
    
    this.setState({
      userSearch: "",
      candidates: [],
      addUsers,
      selectedFoodRestrictions,
      foodRestrictions
    });
  }

  removeUser(e) {
    const curId = e.currentTarget.parentNode.getAttribute("value");
    let newUsers = this.state.addUsers.filter(userId => userId !== curId);
    const {
      foodRestrictions,
      selectedFoodRestrictions
    } = this.updateFoodRestrictions(newUsers);

    this.setState({
      addUsers: newUsers,
      selectedFoodRestrictions,
      foodRestrictions
    });
  }


  renderErrors() {
    if (!_.isEmpty(this.props.errors)) {
      return (
        <ul className="errors" ref={el => this.errorUl = el}>
          {Object.values(this.props.errors).map((error, idx) => (
            <li className="error" key={idx}>
              {error}
            </li>
          ))}
        </ul>
      )
    } else {
      return null;
    }
  }

  render() {    
    return (
      <div className="create-group-form">
        <HomeSearch
          businesses={this.props.businesses}
          updateZoom={this.props.updateZoom}
          coordinates={this.props.coordinates}
        />
        <form className="create-group-form-main" onSubmit={this.handleSubmit}>
          <div className='home-side-map-container'>
            <HomeSideMap
              fetchBusinessesByCoordinates={
                this.props.fetchBusinessesByCoordinates
              }
              form={this.props.form}
              zoom={this.props.zoom}
              businesses={this.props.businesses}
              updateFilter={this.props.updateFilter}
            />
          </div>
          <div className="create-group-form-details">
            <div className="groupname">
              <div className="groupname-container">
                <label>
                  <span>Group Name</span>
                  <div>
                    <input
                      required
                      onChange={this.handleChange("groupName")}
                      className="input-field"
                      type="text"
                      value={this.state.groupName}
                      placeholder="Group Name"
                    />
                    <span className="inputicon">
                      <FontAwesomeIcon
                        icon={faUsers}
                        color="#2c2c2c30"
                        size="sm"
                      />
                    </span>
                  </div>
                </label>
              </div>
            </div>
            <div className="add-users">
              <div className="add-users-container">
                <label className="group-label" htmlFor="add-users">
                  <div className="add-users-title">
                    <span>Add Users</span>
                    <span
                      data-balloon-break
                      aria-label="Search by username / email"
                      data-balloon-pos="down"
                    >
                      <FontAwesomeIcon icon={faInfoCircle} color="lightgray" />
                    </span>
                  </div>
                  <div className="add-users-form">
                    <input
                      onChange={this.handleTextChange}
                      className="input-field"
                      type="text"
                      value={this.state.userSearch}
                      placeholder="Add Users"
                    />
                    <span className="inputicon">
                      <FontAwesomeIcon
                        icon={faUserPlus}
                        color="#2c2c2c30"
                        size="sm"
                      />
                    </span>
                    <div className="auto-complete-users">
                      {this.renderCandidates()}
                    </div>
                  </div>
                </label>
                <div className="added-users">
                  {this.state.addUsers.map((userId, idx) => (
                    <div className="added-user" key={idx} value={userId}>
                      <img src="profile-icon.png" />
                      <span>{this.props.users[userId].username}</span>
                      <span> [{this.props.users[userId].email}] </span>
                      <span onClick={this.removeUser}>
                        <FontAwesomeIcon
                          icon={faTimes}
                          color="#545454"
                          size="sm"
                        />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="optional-divider">
              <div className="get-started-bar"></div>
              <h2>Optional</h2>
              <div className="get-started-bar"></div>
            </div>
            <div className="create-group-form-row">
              <div className="endtime">
                <div className="endtime-container">
                  <label>
                    End Time
                    <input
                      required
                      onChange={this.handleChange("endTime")}
                      className="endtime-input-field"
                      type="datetime-local"
                      value={this.state.endTime}
                    />
                  </label>
                </div>
              </div>
              <div className="is-split">
                <div className="is-split-container">
                  <label> Cost Covered?</label>
                  <label htmlFor="styled">
                    <div className="switch">
                      <input
                        type="checkbox"
                        name="styled"
                        id="styled"
                        onChange={this.handleChange("isSplit")}
                      />
                      <div className="slider"></div>
                    </div>
                  </label>
                  <div className="is-split-explanation">
                    {this.state.isSplit
                      ? "Everyone will split."
                      : "Host will pay for this event."}
                  </div>
                </div>
              </div>
            </div>
            <div className="create-group-form-row">
              <div className="monetary-restriction">
                <div className="monetary-restriction-container">
                  <div className="monetary-restriction-container">
                    <label
                      className="onboarding-label"
                      htmlFor="monetary-restriction"
                    >
                      Monetary Restriction
                    </label>
                    <div className="input-field-container">
                      <div className="drop-down">
                        <button
                          className="drop-down-button"
                          onClick={this.moneyHandle}
                        >
                          Select ▾
                        </button>
                        <div className="list-box" ref={el => (this.listBox = el)}>
                          <ul className="list-box-items">
                            <li className="list-box-item">
                              <label> $ </label>
                              <input
                                value="$"
                                type="radio"
                                onChange={this.moneySelect}
                                checked={this.state.monetaryRestriction === "$"}
                              />
                            </li>
                            <li className="list-box-item">
                              <label> $$ </label>
                              <input
                                value="$$"
                                type="radio"
                                onChange={this.moneySelect}
                                checked={
                                  this.state.monetaryRestriction === "$$"
                                }
                              />
                            </li>
                            <li className="list-box-item">
                              <label> $$$ </label>
                              <input
                                value="$$$"
                                type="radio"
                                onChange={this.moneySelect}
                                checked={
                                  this.state.monetaryRestriction === "$$$"
                                }
                              />
                            </li>
                            <li className="list-box-item">
                              <label> $$$$ </label>
                              <input
                                value="$$$$"
                                type="radio"
                                onChange={this.moneySelect}
                                checked={
                                  this.state.monetaryRestriction === "$$$$"
                                }
                              />
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="food-restriction">
                <div className="food-restriction-container">
                  <label className="group-label" htmlFor="food-restriction">
                    Food Restriction
                  </label>
                  <div className="food-restriction-items">
                    {this.state.selectedFoodRestrictions === null
                      ? null
                      : this.state.selectedFoodRestrictions.map(
                          (selectedFoodRestriction, idx) => (
                            <div className="food-restriction-item" key={idx}>
                              {selectedFoodRestriction}
                            </div>
                          )
                        )}
                  </div>
                </div>
              </div>
            </div>
            <div className="group-errors">
                {this.renderErrors()}
            </div>
          </div>
          <div className="submit-container">
            <input
              className="submit-create-group"
              type="submit"
              value="Create a Group"
            />
            <button className="submit-create-random-group" onClick={this.handleRandomSubmit}>Demo Group</button>
          </div>
        </form>
      </div>
    );
  }
}

export default CreateGroup;