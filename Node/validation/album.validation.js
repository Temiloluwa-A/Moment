const { z } = require('zod');

const pinPositionSchema = z.object({
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
});

module.exports = { pinPositionSchema };
