const express = require('express');
const app = express();

const server = require('http').Server(app);//creating http server
const io = require('socket.io')(server);//initializing socket io to http server

app.set('view engine','ejs');//for viewing webpages using ejs templates
app.use(express.static('public'));//specifying path public

//For creating unique uuid for chat room
const {v4 : uuidV4} = require('uuid');

app.get('/',(req,res)=>{
   // res.redirect(`/${uuidV4()}`);
   res.render('index');
});

app.get('/create',(req,res)=>{
    res.redirect(`/${uuidV4()}`);
 });

app.get('/:room',(req, res)=>{
    res.render('room', { roomId : req.params.room });
});



//Socket code
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        //TO join a room
        socket.join(roomId)
        socket.to(roomId).emit('user-connected', userId)

    })
})


server.listen(3000,()=>{
    console.log("Server is listening..!");
});
