import React, { Component } from 'react';

class UrlResult extends Component {
    constructor(props){
        super(props)
    }
    state = {  }
    render() { 
        return (
            <div>
            
                
                    
                    
                {this.props.urls.forEach((value, index, array) => {
                    console.log(value)
                    return <h1>{value}</h1>
                            
                        
                    
                })}
                        
                        
                    
                </div>
       );
    }
}
 
export default UrlResult;