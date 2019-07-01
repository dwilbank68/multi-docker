import React, { Component } from 'react';
import axios from 'axios';
// import PropTypes from 'prop-types';

// import Fib from './Fib.jsx';
class Fib extends Component {

    // constructor(props, context){
    //     super(props, context);
    //     this.state = {
    //         whatever:{}
    //     }
    //    this.handleClick = this.handleClick.bind(this)
    // }

    // handleClick(e) {
    //
    //    this.setState(prevState => {
    //        return {}
    //    })
    // }

    /////////// ALTERNATIVE 1 - if using create-react-app

    // and you do not need to init the state based on props
    state = { seenIndices: [], values: {}, index: '' };

    // no more constructor or 'this' binding required
    //
    // handleClick = (e) => {
    //    this.setState(prevState => {
    //        return {}
    //    })
    // }

    componentDidMount() {
        this.fetchValues();
        this.fetchIndices();
    }

    async fetchValues() {
        const values = await axios.get('/api/values/current');
        this.setState({values: values.data})
    }

    async fetchIndices() {
        const seenIndices = await axios.get('/api/values/all');
        this.setState({seenIndices: seenIndices.data})
    }

    renderSeenIndices = () => (
        this.state.seenIndices.map(({number}) => number).join(', ')
    )

    handleSubmit = async (e) => {
        e.preventDefault();
        const {index} = this.state;
        await axios.post('/api/values', {index})
        this.setState({index: ''})
    }

    renderValues = () => {
        const entries = [];
        for (let key in this.state.values) {
            entries.push(
                <div key={key}>
                    For Index {key} I calculated {this.state.values[key]}
                </div>
            )
        }
        return entries;
    }

    render() {
        return (
            <div>

                <form onSubmit={this.handleSubmit}>
                    <label>Enter Index:</label>
                    <input  type="text"
                            value={this.state.index}
                            onChange={e => this.setState({index: e.target.value})}/>
                    <button>Submit</button>
                </form>

                <h3>Indices I have seen:</h3>
                {this.renderSeenIndices()}

                <h3>Calculated Values:</h3>
                {this.renderValues()}
            </div>
        );
    }
}

export default Fib;