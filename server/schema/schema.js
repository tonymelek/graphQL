const firebase = require("firebase");
const books = []
const authors = []
// Initialize Cloud Firestore through Firebase
firebase.initializeApp({
    apiKey: 'AIzaSyDB11C5MSoHK56Z4Yvt3dp29pB5UiPM4fQ',
    authDomain: 'bookshop-14ef6.firebaseapp.com',
    projectId: 'bookshop-14ef6'
});
const db = firebase.firestore();
db.collection("Book").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        books.push({ id: doc.id, ...doc.data(), language: doc.data().language.join(',') })
    });
    console.log(books);
});
db.collection("Author").get().then((querySnapshot) => {
    querySnapshot.forEach(doc => {
        authors.push({ id: doc.id, ...doc.data(), languages: doc.data().languages.join(',') })
    })
    console.log(authors);
});

const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLInt, GraphQLList, GraphQLSchema } = graphql;





const BookType = new GraphQLObjectType({
    name: 'Book',
    fields() {
        return {
            id: { type: GraphQLID },
            name: { type: GraphQLString },
            genre: { type: GraphQLString },
            ISBN: { type: GraphQLString },
            barcode: { type: GraphQLString },
            language: { type: GraphQLString },
            location: { type: GraphQLString },
            price: { type: GraphQLInt },
            qty_avilable: { type: GraphQLInt },
            author: {
                type: AuthorType,
                resolve(parent, args) {
                    console.log(authors.find(author => author.id == parent.authorId), parent.authorId);
                    return authors.find(author => author.id === parent.authorId)
                }
            }
        }
    }
});

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    fields() {
        return {
            id: { type: GraphQLID },
            name: { type: GraphQLString },
            languages: { type: GraphQLString },
            books: {
                type: new GraphQLList(BookType),
                resolve(parent, args) {
                    return books.filter(book => book.authorId === parent.id)
                }
            }
        }
    }
})

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType', //are the start points that you can land on for queries, like the basic end points
    fields: {
        book: {
            type: BookType,
            args: { id: { type: GraphQLID } }, //like where in MySQL
            resolve(parent, args) {
                //code to get data from db / other source
                // args.id
                return books.find(book => book.id === args.id)
            }
        },
        author: {
            type: AuthorType,
            args: { id: { type: GraphQLID } }, //like where in MySQL
            resolve(parent, args) {
                //code to get data from db / other source
                // args.id
                return authors.find(author => author.id === args.id)
            }
        },
        books: {
            type: new GraphQLList(BookType),
            args: { genre: { type: GraphQLString } },
            resolve(parent, args) {
                return books.filter(book => book.genre === args.genre)
            }

        }
    }
})
const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addAuthor: {
            type: AuthorType,
            args: {
                name: { type: GraphQLString },
                languages: { type: GraphQLString }
            },
            async resolve(parent, args) {
                try {
                    const data = await db.collection("Author").doc().set({
                        name: args.name,
                        languages: args.languages.replace(/\s/g, '').split(',')
                    })
                    return data
                } catch (error) {
                    console.log(error);
                }

            }

        },
        addBook: {
            type: BookType,
            args: {
                name: { type: GraphQLString },
                genre: { type: GraphQLString },
                ISBN: { type: GraphQLString },
                barcode: { type: GraphQLString },
                language: { type: GraphQLString },
                location: { type: GraphQLString },
                price: { type: GraphQLInt },
                qty_avilable: { type: GraphQLInt },
                authorId: { type: GraphQLID }

            },
            async resolve(parent, args) {
                try {
                    const data = await db.collection("Book").doc().set({
                        name: args.name,
                        genre: args.genre,
                        ISBN: args.ISBN,
                        barcode: args.barcode,
                        language: args.language.replace(/\s/g, '').split(','),
                        location: args.location,
                        price: args.price,
                        qty_avilable: args.qty_avilable,
                        authorId: args.authorId
                    })
                    return data
                } catch (error) {
                    console.log(error);
                }

            }
        }
    }
})


module.exports = new GraphQLSchema({ query: RootQuery, mutation: Mutation })