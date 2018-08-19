// BlogFormReview shows users their form inputs for review
import * as tf from '@tensorflow/tfjs';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import {Webcam} from './webcam';
import axios from 'axios';
import Button from "@material-ui/core/Button";
import {withStyles} from "@material-ui/core/styles";
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import AddIcon from '@material-ui/icons/Add';

const webcam = new Webcam(document.getElementById('webcam'));

let mobilenet

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    display: 'none',
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    margin: theme.spacing.unit,
  },
});

class SignupScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            email: '',
            processing: false,
            photoNum: 0
        }

    }

    async componentDidMount () {
      await webcam.setup();
      mobilenet = await this.loadMobilenet();
    }

    async loadMobilenet () {
      const mobilenet = await tf.loadModel(
        'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json');

      // Return a model that outputs an internal activation.
      const layer = mobilenet.getLayer('conv_pw_13_relu');
      return tf.model({inputs: mobilenet.inputs, outputs: layer.output});
    }

    handleOnChange (value) {
      this.setState({email: value})
    }

    async handleOnClick () {
      this.setState({processing: true})

      const xs = mobilenet.predict(webcam.capture())
      const x_data = await xs.data()
      let params = {email: this.state.email, x: x_data.toString()}
      const res = await axios.post('/api/add_face_data', params)
      if (res) {
        this.setState({processing: false, photoNum: res.data.dataAmount})
        console.log(res.data)
      }
    }

    async handleOnSubmit () {
      this.setState({processing: true})
      const params = {email: this.state.email}
      const res = await axios.post('/api/get_data_amount', params)
      if (res) {
        console.log(res.data)
        this.setState({processing: false, photoNum: res.data.dataAmount})
      }

    }

    render() {
      const {photoNum, processing, name} = this.state
      const { classes } = this.props;
      return (
        <div style={{flexDirection: 'column', display: "flex"}}>

          {/*<div>*/}
            {/*<label htmlFor="">email</label>*/}
            {/*<input type="text" value={this.email} onChange={(event) => {this.handleOnChange(event.target.value)}} />*/}
          {/*</div>*/}
          <div style={{flexDirection: 'row', display: 'flex', justifyContent: "center"}}>
            <FormControl className={classes.formControl} aria-describedby="name-helper-text">
            <InputLabel htmlFor="name-helper">Email</InputLabel>
            <Input id="name-helper" value={name} onChange={this.handleChange} fullWidth disabled={processing}/>
            <FormHelperText id="name-helper-text">{(photoNum >= 3) ? 'you are ready to log in' : 'more photos are needed to login'} (now {photoNum})</FormHelperText>

          </FormControl>
            <Button variant="fab" color="primary" aria-label="Add" className={classes.button} onClick={() => this.handleOnClick()} disabled={processing}>
              <AddIcon />
            </Button>
          </div>

          <div>
            <Button variant="outlined" size="large" color="secondary" className={classes.button} href={"./"}>
              Go Back
            </Button>
          </div>

        </div>
      );
    }
}

export default  withRouter(withStyles(styles)(SignupScreen));
