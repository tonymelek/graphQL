const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const PORT = 5000 || process.env.PORT;
const schema = require('./schema/schema')



const app = express();


app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}));

app.listen(PORT, () => console.log(`Express server now up and listening on port ${PORT}`))