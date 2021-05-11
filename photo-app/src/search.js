import React, { Component } from "react";
import './search.scss';
import constants from "./constants.js";
import { scrollAreaAvailable, throttle, parseJSON } from "./utils.js";
import { Row,Col } from 'reactstrap';

class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            imgUrls: [],
            lat:'',
            log: '',
            currentIndex: null,
            pageNumber: 1,
            show: false,
            data_points : [],
            cur_name :'',
            favourites:false,
            favpagenumber: 0,
            scrol: false
        };
        this.renderImageContent = this.renderImageContent.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.showModal = this.showModal.bind(this);
        this.hideModal = this.hideModal.bind(this);
        this.handleOnChangeselect = this.handleOnChangeselect.bind(this);
        this.get_lat_long = this.get_lat_long.bind(this)
        this.getFavourites = this.getFavourites.bind(this);
    }

    showModal = () => {
        this.setState({ show: true });
      };
    
    hideModal = () => {
    this.setState({ show: false });
    };

    componentDidMount() {
        window.onscroll = throttle(() => {
			if (scrollAreaAvailable()) return;
            if(this.state.favourites === true){
                this.setState({'scrol': true})
                this.getFavourites();
            }
            else{
                this.handleScroll();
            }
		}, 1000);

       this.get_lat_long()
    }
    get_photos(){
        const url = constants.BASE_URL + "photos?lat=" + (this.state.lat) + "&log=" + (this.state.log);
        fetch(url)
            .then(parseJSON)
            .then(resp => {
                let image_list = []
                resp.photos.photo.forEach(photo => image_list.push(
                    {url: `https://live.staticflickr.com//${photo.server}//${photo.id}_${photo.secret}_b.jpg`,
                    photo_server: photo.server,
                    photo_id: photo.id,
                    photo_secret:photo.secret }))
                this.setState({imgUrls: image_list})
            })
            .catch(err => {
                console.log(err);
            });
    }
    get_lat_long(){
        const url = constants.BASE_URL + "lat-log"
        fetch(url)
        .then(parseJSON)
        .then(resp => {
            if(resp.length > 0){
                this.setState({
                    data_points: resp,
                    cur_name: resp[0]['name'],
                    lat: resp[0]['lat'],
                    log: resp[0]['log']
                }, () =>{
                    this.get_photos()
                })
            }
            else{
                this.setState({
                    lat: 40.7128,
                    log: 74.0060
                },() =>{
                    this.get_photos()
                })
            }
        })
        .catch(err => {
            console.log(err);
        });
    }

    handleScroll() {
        const url = constants.BASE_URL + "photos?lat=" + (this.state.lat) + "&log=" + (this.state.log) + "&page=" + (this.state.pageNumber + 1);
        fetch(url)
            .then(parseJSON)
            .then(resp => {
                resp.photos.photo.forEach(photo => this.state.imgUrls.push(
                    {url: `https://live.staticflickr.com//${photo.server}//${photo.id}_${photo.secret}_b.jpg`,
                    photo_server: photo.server,
                    photo_id: photo.id,
                    photo_secret:photo.secret}))
                this.setState({
                    imgUrls: this.state.imgUrls,
                    pageNumber: resp.photos.page,
                })
            })
            .catch(err => {
                console.log(err);
            });
    }
    renderoption(src, index) {
        return (
            <option value={src.name} key={src.name}>{src.name}</option>
        ) 
    }
    renderImageContent(src, index) {
        let favourites = this.state.favourites === true ? 'favourite': '';
        return (
          <div className={favourites} photo_id={src.photo_id} photo_server={src.photo_server} photo_secret={src.photo_secret} onClick={(e) => this.imageClick(e)}>
            <img src={src.url} key={src.photo_id} width="500" height="300" alt={src.photo_id}/>
          </div>
        ) 
    }

    imageClick(event) {
        let photo_id = event.target.getAttribute('photo_id')
        let photo_server = event.target.getAttribute('photo_server')
        let photo_secret = event.target.getAttribute('photo_secret')
        event.target.classList.add("active");
        const url = constants.BASE_URL + "favorites"
        const data = { 'photo_id': photo_id, "photo_server":photo_server ,"photo_secret":photo_secret}
        fetch(url,{
            'method': 'POST',
            "headers": {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
        })
        .then(parseJSON)
        .then(resp => {
            if(resp.success === "success"){
                event.target.classList.add("active");
            }
            else{
                alert("already added to favourites")
            }
        })
        .catch(err => {
            console.log(err);
        });
    }

    getFavourites(){
        if(this.state.scrol === false ){
            this.state.imgUrls = []
            this.state.favpagenumber = 0
        }
        const url = constants.BASE_URL + "favorites?" + "page=" + (this.state.favpagenumber + 1);
        fetch(url,{})
        .then(parseJSON)
        .then(resp => {
            resp.forEach(photo => this.state.imgUrls.push(
                {url: `https://live.staticflickr.com//${photo.photo_server}//${photo.photo_id}_${photo.photo_secret}_b.jpg`,
                photo_server: photo.photo_server,
                photo_id: photo.photo_id,
                photo_secret:photo.photo_secret }))
            this.setState({imgUrls: this.state.imgUrls,favourites: true,favpagenumber: this.state.favpagenumber + 1})
        })
        .catch(err => {
            console.log(err);
        });
    }

    handleOnChangelat = event => {
        this.setState({ lat: event.target.value });
    };
    handleOnChangeselect = event => {
        this.setState({ 
            cur_name: event.target.value,
            lat:this.state.data_points.filter(data => data.name === event.target.value)[0]['lat'],
            log:this.state.data_points.filter(data => data.name === event.target.value)[0]['log'] });
    };
    handleOnChangelog = event => {
        this.setState({ log: event.target.value });
    };
    handleSearch = () => {
        this.setState({favourites: false})
        this.get_photos()
    };
    render() {
        return (
            <div>
                <h1>Welcome to the search app</h1>
                <div className='rowC' >
                    <button onClick={this.showModal}>ADD</button>
                    <select value={this.state.cur_name} onChange={event => this.handleOnChangeselect(event)}>
                        {this.state.data_points.map(this.renderoption)}
                    </select>
                    <input name="lat" type="text" placeholder="Latitude" onChange={event => this.handleOnChangelat(event)} value={this.state.lat}/>
                    <input name="log" type="text" placeholder="Longitude" onChange={event => this.handleOnChangelog(event)} value={this.state.log}/>
                    <button onClick={this.handleSearch}>Search</button>
                    <button onClick={this.getFavourites}>Favourite</button>
                </div>
                <div className="gallery-grid">
                    {this.state.imgUrls.map(this.renderImageContent)}
                </div>
                <Modal show={this.state.show} handleClose={this.hideModal} lat_long={this.get_lat_long}>
                        <p>Modal</p>
                </Modal>
            </div>
        );
        
    }
}


  class Modal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lat:'',
            log: '',
            name: ''
        }
        this.handleOnChangelat = this.handleOnChangelat.bind(this);
        this.handleOnChangelog = this.handleOnChangelog.bind(this);
        this.handleOnChangename = this.handleOnChangename.bind(this);
        this.submitClick = this.submitClick.bind(this);
    }
    handleOnChangelat = event => {
        this.setState({ lat: event.target.value });
    };
    handleOnChangelog = event => {
        this.setState({ log: event.target.value });
    };
    handleOnChangename = event => {
        this.setState({ name: event.target.value });
    };
    submitClick() {
        const url = constants.BASE_URL + "lat-log-create"
        const data = { 'lat': this.state.lat, "log":this.state.log ,"name":this.state.name}
        if(this.state.lat === "" || this.state.log === "" || this.state.name === ""){
            alert(" Values cannot be empty")
            return
        }
        fetch(url,{
            'method': 'POST',
            "headers": {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
        })
        .then(parseJSON)
        .then(resp => {
            if(resp.success === "success"){
                this.props.lat_long()
                this.props.handleClose()
                this.setState({lat:'',log:'',name:''})
            }
            else{
                alert("Name already exist please enter different name")
            }
        })
        .catch(err => {
            console.log(err);
        });
    };

    render(){
        const showHideClassName = this.props.show ? "modal display-block" : "modal display-none";
        const handleClose = this.props.handleClose
        return (
            <div className={showHideClassName}>
              <section className="modal-main">
                  <Row>
                    <label>Latitude:</label><input name="lat" className="label_left" type="text" placeholder="Latitude" onChange={event => this.handleOnChangelat(event)} value={this.state.lat}/>
                    <label>Longitude:</label><input name="log" className="label_left" type="text" placeholder="Longitude" onChange={event => this.handleOnChangelog(event)} value={this.state.log}/>
                    <label>Name:</label><input name="name" className="label_left" type="text" placeholder="Name" onChange={event => this.handleOnChangename(event)} value={this.state.name}/>
                    <button type="button" className="label" onClick={this.submitClick}>Submit</button>
                    <button type="button" className="label" onClick={handleClose}>Close</button>
                  </Row>
              </section>
            </div>
          );
    }
  };
  
export default Search;