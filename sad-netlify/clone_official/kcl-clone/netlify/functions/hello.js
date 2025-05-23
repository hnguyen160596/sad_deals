/**
 * A simple Netlify function for testing
 */
exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello from Sales Aholics Deals API!"
    })
  };
};
