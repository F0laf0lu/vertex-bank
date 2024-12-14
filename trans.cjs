const https = require("https");

const params = JSON.stringify({
    type: "nuban",
    // name: "Folafolu Osilaja",
    account_number: "8057251720",
    bank_code: "999992",
    currency: "NGN",
});

const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: "/transferrecipient",
    method: "POST",
    headers: {
        Authorization: "Bearer sk_test_1b60305d6d910d71d16db6442a436034c671f9be",
        "Content-Type": "application/json",
    },
};

const req = https
    .request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
            data += chunk;
        });

        res.on("end", () => {
            console.log(JSON.parse(data));
        });
    })
    .on("error", (error) => {
        console.error(error);
    });

req.write(params);
req.end();


