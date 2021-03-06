import React from 'react';
import './home_search.css';
import { faSearch, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Zipcode } from './zipcode';
import "balloon-css";
import _ from "lodash";

class HomeSearch extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            searchText: "",
            neighborhoods: Zipcode.map(el => el.neighborhood),
            options: []
        }

        this.zipcode = Zipcode;
        this.optionSelected = this.optionSelected.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.inputChange = this.inputChange.bind(this);
    }

    handleSubmit(e){    
        e.preventDefault();
        const selectedNeighborhood = this.zipcode.filter((zipcode) => zipcode.neighborhood === this.state.searchText)
        if (selectedNeighborhood.length !== 0){
            this.props.updateZoom(selectedNeighborhood[0]);
        }
    }

    inputChange(e){
        const value = e.target.value;
        let options = [];
        if (value.charCodeAt(0) === 92) return null;
        if (value.length > 0) {
            const regex = new RegExp(`${value.toLowerCase()}`, 'i');
            options = this.state.neighborhoods.sort().filter(nh => regex.test(nh.toLowerCase()));
        }
        this.setState({
            options,
            searchText: value
        })
    }

    async optionSelected(e) {
      await this.setState({
        searchText: e.nativeEvent.target.innerText,
        options: []
      })
      this.handleSubmit(e);
    }

    renderOptions() {
        const { options } = this.state;
        if (options.length === 0) return null;
        return (
            <div className="auto-complete-options-container">
                {options.slice(0, 5).map((item, idx) => <li onClick={this.optionSelected} key={idx}><span>{item}</span></li>)}
            </div>
        )
    }

    findCurNeighborhood (){
        const curLng = (this.props.coordinates._sw.lng + this.props.coordinates._ne.lng) / 2;
        const curLat = (this.props.coordinates._sw.lat + this.props.coordinates._ne.lat) / 2;

        this.curCoordinates = {
            lng: curLng,
            lat: curLat
        }

        const zipcodeValues = Object.values(Zipcode);
        let shortestDistance;
        for (let i = 0; i < zipcodeValues.length; i++){
            const curNH = zipcodeValues[i];            
            const curDistance = (curLng - curNH.longitude)**2 + (curLng - curNH.longitude)**2;
            if (this.curNeighborhood === undefined || shortestDistance === undefined){
                shortestDistance = curDistance;
                this.curNeighborhood = zipcodeValues[0].neighborhood;
                continue;
            }

            if (shortestDistance > curDistance) {
              shortestDistance = curDistance;
              this.curNeighborhood = zipcodeValues[i].neighborhood;
            }
        }
    }   
    
    render(){
      const neighborhoodList = "The List of Neighborhoods in SF \n - " + Zipcode.map(
        zipcode => zipcode.neighborhood
      ).join("\n - ");
      
      const homeSearchSelected = () => {
        if (_.isEmpty(this.props.businesses)) {
          return (
            <div className="home-search-selected">
              <div className="home-search-selected-restaurants">
                <span className="home-search-numbiz">Choose a location with more than 4 valid business.</span>
              </div>
            </div>
          );
        } else {
          this.findCurNeighborhood();
          const curNumOfBizs = Object.keys(this.props.businesses).length;
          return(
            <div className="home-search-selected">
              <div className="home-search-selected-restaurants">
                <span>Currently, </span>
                <span className="home-search-numbiz">{curNumOfBizs}</span>
                <span>
                  {curNumOfBizs === 1 ? "restaurant is " : "restaurants are "}
                    selected
                </span>
                <span> near</span>
                <span className="home-search-curNH">{this.curNeighborhood}</span>
              </div>
            </div>
          )
        }
      }      

      return (
        <form className="home-search-section" onSubmit={this.handleSubmit}>
          <div className="home-search-section-title">
            <span>Search by neighborhood</span>
            <span
              data-balloon-break
              aria-label={neighborhoodList}
              data-balloon-pos="down"
            >
              <FontAwesomeIcon
                icon={faInfoCircle}
                style={{ color: "lightgray" }}
              />
            </span>
          </div>
          <div className="home-search-bar">
            <div className="home-search-bar-container">
              <input
                type="search"
                placeholder="Filter by neighborhood"
                onChange={this.inputChange}
                value={this.state.searchText}
              />
              <div className="auto-complete-options">
                {this.renderOptions()}
              </div>
            </div>
            <button className="home-search-icon" onSubmit={this.handleSubmit}>
              <FontAwesomeIcon icon={faSearch} style={{ color: "black" }} />
            </button>
          </div>
          {homeSearchSelected()}          
        </form>
      );
    }
}

export default HomeSearch;
