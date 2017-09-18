var mysql = require("mysql");
var inquirer = require("inquirer");
var colors = require('colors');

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",
    port: 8889,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "Bamazon"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
    if (err) throw err;
    console.log("");
});

connection.query("SELECT * FROM products", function(err, res) {
    console.log('---------------------------------');
        console.log('Welcome to Bamazon');
        console.log('---------------------------------\n');

    for (var i = 0; i < res.length; i++) {
        console.log("ID: " + res[i].ItemID + " | " + "Product: " + res[i].ProductName + " | " + "Department: " + res[i].DepartmentName + " | " + "Price: " + res[i].Price + " | " + "QTY: " + res[i].StockQuantity);
        console.log('--------------------------------------------------------------------------------------------------')
    }
    console.log("");
    start();
});



var start = function() {

    inquirer.prompt([{
            name: "id",
            type: "input",
            message: "Which ID of the product would you like to buy?",
            validate: function(value) {
                if (isNaN(value) === false && value <= 10) {
                    return true;
                } else {
                    return false;
                }
            }
        }, {
            name: "quantity",
            type: "input",
            message: "How much would you like to purchase?",
            validate: function(value) {
                if (isNaN(value)) {
                    return false;
                } else {
                    return true;
                }
            }
        }

    ]).then(function(answer) {

        var query = "SELECT DepartmentName, StockQuantity, Price FROM products WHERE ?"
        connection.query(query, { ItemID: answer.id }, function(err, res) {

            if (res[0].StockQuantity >= answer.quantity) {

                var dept = res[0].DepartmentName;
                var adjustedQuantity = res[0].StockQuantity - answer.quantity;
                var purchasePrice = (answer.quantity * res[0].Price).toFixed(2);

                var query2 = " UPDATE products SET ? WHERE ?";
                connection.query(query2, [{ StockQuantity: adjustedQuantity }, { ItemID: answer.id }],

                    function(err, res) {

                        if (err) throw err;
                        console.log("Success! Your total is $".bold + purchasePrice.bold + "\nYour item(s) will be shipped to you in 3-5 business days.".bold);

                    });



                var query3 = "SELECT TotalSales FROM Departments WHERE ?"
                connection.query(query3, { DepartmentName: dept }, function(err, data) {

                    if (err) throw err

                    var currentSales = data[0].TotalSales;
                    var adjustedSales = currentSales + parseFloat(purchasePrice);





                    var query4 = "UPDATE Departments SET ? WHERE ? "
                    connection.query(query4, [{ TotalSales: adjustedSales }, { DepartmentName: dept }], function(err, data) {

                        if (err) throw err
                        start();


                    })

                })

            } else {
                console.log("Sorry, there are ".bold + res[0].StockQuantity + " units in stock for this product".bold);
                console.log("\n-----------------------------------------\n");

                start();

            }

            

        })

    })
}