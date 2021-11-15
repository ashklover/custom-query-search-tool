import logo from './logo.svg';
import './App.css';
import './App.css';
import 'semantic-ui-css/semantic.min.css';
import { Button, Form, Select, Grid, Container, Segment, Input, Dropdown, Icon, Divider, Table, Pagination } from "semantic-ui-react";
import { restaurantIdOptions, transactionTimeOptions, measureOptions, metricOptions, operatorTypeOptions } from './Utility';
import React, {useState, useEffect} from "react";
import { ReactDatez } from 'react-datez';
import moment from 'moment';



const initialFormData = {
    restaurantIds: [],
    fromDate: "",
    toDate: "",
    fromHour: 6,
    toHour: 29,
    metricCriteria: [{
        metricCode: "",
        compareType: "",
        value: "",
        operatorType: "And"
    }]
};

const newCriteriaData = {
    metricCode: "",
    compareType: "",
    value: "",
    operatorType: "And"
};

function App() {

    const [restaurantIds, setRestaurantIds] = useState([]);
    const [fromHour, setFromHour] = useState(6);
    const [toHour, setToHour] = useState(29);
    const [fromDate, setFromDate] = useState("2021-10-01");
    const [toDate, setToDate] = useState("2021-10-26");
    const [metrics, setMetrics] = useState([]); // this gets the metric names from the API
    const [metricCode, setMetricCode] = useState("");
    const [comparator, setComparator] = useState("");
    const [compareValue, setCompareValue] = useState(0);
    const [resultsData, setResultsData] = useState([]);
    const [activePage, setActivePage] = useState(1);
    const [metricCriteria, setMetricCriteria] = useState([newCriteriaData]); // holds the data for metrics comparisons
    

    useEffect(() => {
        getMetrics().then(data => {setMetrics(data);
        console.log(data);
        });
    }, [])

    async function getMetrics() {
        const response = await fetch('https://customsearchqueryapi.azurewebsites.net/Search/MetricDefinitions');
        const promise = await response.json(); //extract JSON from the http response
        return promise;
    }

    // FORMATTING NUMERICAL VALUES
    function formatValues(value, dataType, decimalPlaces) {
        if (dataType === "Percent") {
            return "" + (value*100).toFixed(decimalPlaces) + "%";
        } else if (dataType === "Money") {
            return "$" + value.toFixed(decimalPlaces);
        } else if (dataType === "Date") {
            return "" + moment(value).format("MM/DD/YYYY");
        } else if (dataType === "Time") {
            return moment(value).format("hh:mm:ss");
        } else {
            return "" + Number(value).toFixed(decimalPlaces);
        }
    }

    // PAGINATION
    const numItems = 20; // number of items per page. Overflow goes to next page
    const paginatedResults = resultsData.slice((activePage-1)*numItems, activePage*numItems);


    // ADD CRITERIA
    function addCriteria() {
        // append a new empty criterion to the current metric criteria, updates metric criteria variable
        console.log(metricCriteria)
        const updatedCriteria = [];
        console.log(updatedCriteria);
        for (var i=0; i<metricCriteria.length; i++){
            updatedCriteria[i] = {...metricCriteria[i]};
        }
        console.log(updatedCriteria);
        updatedCriteria.push(newCriteriaData);
        //console.log(metricCriteria);
        setMetricCriteria(updatedCriteria);
    }

    // REMOVE CRITERIA
    function removeCriteria(index) {
        const updatedCriteria = [];
        for (var i=0; i<metricCriteria.length; i++){
            updatedCriteria[i] = {...metricCriteria[i]};
        }
        updatedCriteria.splice(index, 1);
        setMetricCriteria(updatedCriteria);
    }

    // CHANGE CRITERIA
    function changeMetricCriteria(propertyName, data, index) {
        const updatedCriteria = [];
        for (var i=0; i<metricCriteria.length; i++){
            updatedCriteria[i] = {...metricCriteria[i]};
        }
        if (propertyName === "value"){
            updatedCriteria[index][propertyName] = Number(data.value);
        } else {
            updatedCriteria[index][propertyName] = data.value;
        }
        console.log(index);
        console.log(updatedCriteria);
        setMetricCriteria(updatedCriteria);
    }


    function onSubmit() {
        const formData = {
            restaurantIds: restaurantIds,
            fromDate: fromDate,
            toDate: toDate,
            fromHour: fromHour,
            toHour: toHour,
            metricCriteria: metricCriteria
            /*metricCriteria: [{
                metricCode: metricCode,
                compareType: comparator,
                value: Number(compareValue),
                operatorType: "And"
            }]*/
        };
        
        console.log(formData);
        const userAction = async (data) => {
            // post request
            try {
                const response = await fetch('https://customsearchqueryapi.azurewebsites.net/Search/Query', {
                    method: 'POST',
                    cache: 'no-cache',
                    body: JSON.stringify(data), // string or object
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                return response.json();
            } catch (error){
                 console.log("error", error);
            }
        }
        userAction(formData).then(data => {
            console.log(data)
            setResultsData(data)
            setActivePage(1)
        });
    }
    // to add criteria
    // <Button onClick={() => addCriteria()} color="violet">Add Criteria</Button>
    console.log(metricCriteria);
    return (
        <div className="App">
            <Grid>
                <Grid.Row>
                    <Container>
                        <Segment className="Segment">
                            <Grid centered>
                                <Grid.Row columns="1">
                                    <Grid.Column textAlign="center">
                                        <h3>Custom Search Query Tool</h3>
                                    </Grid.Column>
                                </Grid.Row>
                                <Grid.Row columns="1">
                                    <Grid.Column>
                                        <Form onSubmit={() => onSubmit()}>
                                            <Form.Field>
                                                <label style={{fontWeight: "bold"}}>Restaurant Id</label>
                                                <Dropdown
                                                    options={restaurantIdOptions}
                                                    placeholder={"Select Restaurant Id"}
                                                    multiple
                                                    selection
                                                    onChange={(event, data) => setRestaurantIds(data.value)}
                                                    value={restaurantIds}
                                                />
                                            </Form.Field>
                                            <Form.Group>
                                                <Form.Field
                                                    control={Select}
                                                    label={"Transaction Time Start"}
                                                    options={transactionTimeOptions}
                                                    value={fromHour}
                                                    onChange={(event, data) => setFromHour(data.value)}
                                                />
                                                <Form.Field
                                                    control={Select}
                                                    label={"Transaction Time End"}
                                                    options={transactionTimeOptions}
                                                    value={toHour}
                                                    onChange={(event, data) => setToHour(data.value)}
                                                />
                                                
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Field>
                                                    <label style={{fontWeight: "bold"}}>Transaction Start Date</label>
                                                    <ReactDatez
                                                        name="dateInput"
                                                        handleChange={(value) => setFromDate(value)}
                                                        value={fromDate}
                                                        allowPast={true}
                                                        dateFormat={"MM/DD/YYYY"}
                                                        placeholder={"MM/DD/YYYY"}
                                                        startDate={"2021-10-01"}
                                                        endDate={"2021-10-26"}
                                                    />
                                                </Form.Field>
                                                <Form.Field>
                                                    <label style={{fontWeight: "bold"}}>Transaction End Date</label>
                                                    <ReactDatez
                                                        name="dateInput"
                                                        handleChange={(value) => setToDate(value)}
                                                        value={toDate}
                                                        allowPast={true}
                                                        dateFormat={"MM/DD/YYYY"}
                                                        placeholder={"MM/DD/YYYY"}
                                                        startDate={"2021-10-01"}
                                                        endDate={"2021-10-26"}
                                                    />
                                                </Form.Field>
                                            </Form.Group>
                                            
                                            
                                            {metricCriteria.map((x, index) => {
                                                return (
                                                    <Form.Group key={index}>
                                                        {metricCriteria.length > 1 &&
                                                            <Form.Field width={1}>
                                                                <div style={{position: "relative", top: "28px", cursor: "pointer"}}>
                                                                    <Icon name="remove circle" onClick={() => removeCriteria(index)} size="big" color="red" />
                                                                </div>
                                                            </Form.Field>
                                                        }
                                                        <Form.Field
                                                            width={5}
                                                            control={Select}
                                                            label={"Metric"}
                                                            options={metricOptions}
                                                            placeholder={"Select Metric"}
                                                            value={metricCriteria[index].metricCode}
                                                            onChange={(event, data) => changeMetricCriteria("metricCode", data, index)}
                                                        />
                                                        <Form.Field
                                                            width={4}
                                                            control={Select}
                                                            label={"Comparator"}
                                                            options={measureOptions}
                                                            placeholder={"Select Comparator"}
                                                            value={metricCriteria[index].compareType}
                                                            onChange={(event, data) => changeMetricCriteria("compareType", data, index)}
                                                        />
                                                        <Form.Field
                                                            width={3}
                                                            control={Input}
                                                            label={"Value"}
                                                            placeholder={"Enter numerical value, e.g. 3"}
                                                            value={metricCriteria[index].value}
                                                            onChange={(event, data) => changeMetricCriteria("value", data, index)}
                                                        />
                                                    </Form.Group>
                                                );
                                            })}
                                            

                                            <Form.Group>
                                                <Form.Field>
                                                    <Button type="button" onClick={() => addCriteria()} color="violet">Add Criteria</Button>
                                                </Form.Field>
                                            </Form.Group>
                                            <Form.Field>
                                                <Button color="olive" type="submit">
                                                    Submit
                                                </Button>
                                            </Form.Field>
                                        </Form>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Segment>
                    </Container>
                </Grid.Row>
                <Divider hidden></Divider>
                <Grid.Row>
                    <Container>
                        <Segment>

                            <Grid>
                                <Grid.Row>
                                    <Grid.Column>
                                        <h3>Results</h3>
                                    </Grid.Column>
                                    <Grid.Column textAlign="right">
                                        {resultsData.length >= numItems &&
                                            <Pagination
                                                className={'Pager'}
                                                size='small'
                                                activePage={activePage}
                                                onPageChange={(event, data) => setActivePage(data.activePage)}
                                                totalPages={Math.ceil(resultsData.length / numItems)}
                                                ellipsisItem={{
                                                    content: <Icon name='ellipsis horizontal' />,
                                                    icon: true
                                                }}
                                                firstItem={null}
                                                lastItem={null}
                                                prevItem={null}
                                                nextItem={null}
                                            />
                                        }
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>

                            
                            <Table>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>
                                            Restaurant ID
                                        </Table.HeaderCell>
                                        <Table.HeaderCell>
                                            Transaction Date
                                        </Table.HeaderCell>
                                        <Table.HeaderCell>
                                            Order Time
                                        </Table.HeaderCell>
                                        <Table.HeaderCell>
                                            Order Number
                                        </Table.HeaderCell>
                                        {
                                            metrics.map((n, index2) => {
                                                return (
                                                    <Table.HeaderCell key={index2}>
                                                        {n.alias}
                                                    </Table.HeaderCell>
                                                );
                                            })
                                        }
                                    </Table.Row>
                                </Table.Header>
                                
                                    <Table.Body>
                                        {paginatedResults.map((d, index) => {
                                            return(
                                                <Table.Row key = {index}>
                                                    <Table.Cell>
                                                        {d["restaurantId"]}
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        {formatValues(d["busDt"], "Date", 0)}
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        {formatValues(d["orderTime"], "Time", 0)}
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        {d["orderNumber"]}
                                                    </Table.Cell>
                                                    {
                                                        metrics.map((n, index2) => {
                                                            const fieldname = n.metricCode[0].toLowerCase() + n.metricCode.substring(1);
                                                            return (
                                                                <Table.Cell key={index2}>
                                                                    {formatValues(d[fieldname], n.dataType, n.decimalPlaces)}
                                                                </Table.Cell>
                                                            );
                                                        })
                                                    }
                                                </Table.Row>
                                            )
                                        })}
                                    </Table.Body>
                                
                            </Table>
                        </Segment>
                    </Container>
                </Grid.Row>
            </Grid>
        </div> 
    );
}

export default App;




/* old metric criterion menu
                                            
                                            <Form.Field>
                                                <label style={{fontWeight: "bold"}}>Metrics</label>
                                                <Dropdown
                                                    control = {Select}
                                                    options={metricOptions}
                                                    placeholder={"Select Metrics"}
                                                    selection
                                                    value={metricCode}
                                                    onChange={(event, data) => setMetricCode(data.value)}
                                                />

                                            </Form.Field>
                                            <Form.Group>
                                                <Form.Field>
                                                <label style={{fontWeight: "bold"}}>Comparator</label>
                                                <Dropdown
                                                    options={measureOptions}
                                                    placeholder={"Select Comparator"}
                                                    selection
                                                    onChange={(event, data) => setComparator(data.value)}
                                                    value={comparator}
                                                />
                                                </Form.Field>
                                                <Form.Field>
                                                <label style={{fontWeight: "bold"}}>Compare Value</label>
                                                    <Input
                                                    text
                                                    value={compareValue}
                                                    onChange={(event, data) => setCompareValue(data.value)}
                                                    />
                                                </Form.Field>
                                            </Form.Group>

*/

