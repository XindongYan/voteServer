
module.exports = function () {
    return async function (ctx, next) {
        if (ctx.method === 'POST') {
            ctx.params = ctx.request.body;
        } else {
            ctx.params = ctx.query;
        }

        await next();
    }
}
