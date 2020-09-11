var bodyParser  = require('body-parser'),
    methodOverride = require('method-override'),
    expressSanitizer = require('express-sanitizer'),
    mongoose    = require('mongoose'),
    express     = require('express'),
    app         = express();

const { StringDecoder } = require('string_decoder');

// APP setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer);
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.set("view engine", "ejs");

//Mongo setup
mongoose.connect('mongodb://localhost:27017/blogApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to DB!'))
    .catch(error => console.log(error.message));

var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

app.get('/', function(req,res){
    res.redirect('/blogs');
});

//index
app.get('/blogs', function(req,res){
    Blog.find({}, function(err,blogs){
        if(err){
            console.log(err);
        } else {
            res.render('index', {blogs:blogs});
        }
    })
});

//new
app.get('/blogs/new', function(req,res){
    res.render('new');
})

//create
app.post('/blogs', function(req,res){
    req.body.blog.body = req.expressSanitizer(req.body.blog.body);
    Blog.create(req.body.blog, function(err,newBlog){
        if(err){
            res.render('new');
        } else {
            res.redirect('/blogs');
        }
    })
})

//show route
app.get('/blogs/:id', function(req,res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect('/blogs');
        } else {
            res.render('show', {blog:foundBlog});
        }
    })

})

//edit
app.get('/blogs/:id/edit', function(req,res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect('/blogs');
        } else {
            res.render('edit', {blog: foundBlog});
        }
    });
});

//update route
app.put('/blogs/:id', function(req,res){
    req.body.blog.body = req.expressSanitizer(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect('/blogs');
        } else {
            res.redirect('/blogs/' + req.params.id)
        }
    })
});

//destroy route
app.delete('/blogs/:id', function(req,res){
    Blog.findByIdAndRemove(req.params.id, function(err, deleted){
        if(err){
            console.log(err);
        } else {
            res.redirect('/blogs')
        }
    })
})

app.listen(3000, 'localhost', function () {
    console.log('server has started');
});