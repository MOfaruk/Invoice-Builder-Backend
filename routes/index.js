var express = require('express');
var router = express.Router();

var knex = require('knex')({
  client: 'mysql',
  connection: {
    host     : '127.0.0.1',
    user     : 'root',
    password : '1234',
    database : 'invoicebuilder',
    charset  : 'utf8'
  }
});

var bookshelf = require('bookshelf')(knex);

var User = bookshelf.Model.extend({
  tableName: 'users',
  invoices: function() {
    return this.hasMany(Invoice,'author_id','id');
  }
});

var Invoice = bookshelf.Model.extend({
  tableName: 'invoices',
  products: function() {
    return this.hasMany(Product,'invoice_id','id');
  }
}); 

var Product = bookshelf.Model.extend({
  tableName: 'products',

});



/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express',body: 'this is body' });
});


// invoice API
router.get('/invoice', function(req, res) {
	User.where({id: 1}).fetch({withRelated: ['invoices']}).then(function(invoice) {
	  res.json(invoice.related('invoices').toJSON());
	});
});

router.post('/invoice', function(req, res) {
	Invoice.forge({
      author_id: 1
    })
    .save()
    .then(function (invoice) {
      res.json({error: false, data: {id: invoice.get('id')}});
    })
    .catch(function (err) {
      res.status(500).json({error: true, data: {message: err.message}});
    });
});

router.route('/invoice/:id')
  .get(function (req, res) {
    Invoice.forge({id: req.params.id})
    .fetch()
    .then(function (invoice) {
      if (!invoice) {
        res.status(404).json({error: true, data: {}});
      }
      else {
        res.json({error: false, data: invoice.toJSON()});
      }
    })
    .catch(function (err) {
      res.status(500).json({error: true, data: {message: err.message}});
    });
  })
  // update invoice details
  .put(function (req, res) {
    Invoice.forge({id: req.params.id})
    .fetch({require: true})
    .then(function (invoice) {
      invoice.save({
        bill_to: req.body.bill_to || invoice.get('bill_to'),
        created_at: req.body.created_at || invoice.get('created_at')
      })
      .then(function () {
        res.json({error: false, data: {message: 'Invoice details updated'}});
      })
      .catch(function (err) {
        res.status(500).json({error: true, data: {message: err.message}});
      });
    })
    .catch(function (err) {
      res.status(500).json({error: true, data: {message: err.message}});
    });
  })
  // delete a invoice
  .delete(function (req, res) {
    Invoice.forge({id: req.params.id})
    .fetch({require: true})
    .then(function (invoice) {
      invoice.destroy()
      .then(function () {
        res.json({error: false, data: {message: 'Invoice successfully deleted'}});
      })
      .catch(function (err) {
        res.status(500).json({error: true, data: {message: err.message}});
      });
    })
    .catch(function (err) {
      res.status(500).json({error: true, data: {message: err.message}});
    });
  });



// product API
router.post('/product', function(req, res) {
	Product.forge({
    invoice_id: 1
  })
  .save()
  .then(function (product) {
    res.json({error: false, data: {id: product.get('id')}});
  })
  .catch(function (err) {
    res.status(500).json({error: true, data: {message: err.message}});
  });
});

router.route('/product/:id')
.get(function (req, res) {
  Product.forge({id: req.params.id})
  .fetch()
  .then(function (product) {
    if (!product) {
      res.status(404).json({error: true, data: {}});
    }
    else {
      res.json({error: false, data: product.toJSON()});
    }
  })
  .catch(function (err) {
    res.status(500).json({error: true, data: {message: err.message}});
  });
})
// update product details
.put(function (req, res) {
  Product.forge({id: req.params.id})
  .fetch({require: true})
  .then(function (product) {
    product.save({
      name: req.body.name || product.get('name'),
      hourly_rate: req.body.hourly_rate || product.get('hourly_rate'),
      hours: req.body.hours || product.get('hours')
    })
    .then(function () {
      res.json({error: false, data: {message: 'Product details updated'}});
    })
    .catch(function (err) {
      res.status(500).json({error: true, data: {message: err.message}});
    });
  })
  .catch(function (err) {
    res.status(500).json({error: true, data: {message: err.message}});
  });
})
// delete a product
.delete(function (req, res) {
  Product.forge({id: req.params.id})
  .fetch({require: true})
  .then(function (product) {
    product.destroy()
    .then(function () {
      res.json({error: false, data: {message: 'Product successfully deleted'}});
    })
    .catch(function (err) {
      res.status(500).json({error: true, data: {message: err.message}});
    });
  })
  .catch(function (err) {
    res.status(500).json({error: true, data: {message: err.message}});
  });
});

module.exports = router;
