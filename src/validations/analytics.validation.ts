import Joi from 'joi';

export const analyticsQuerySchema = Joi.object({
    period: Joi.string()
        .valid('today', 'week', 'month', 'year')
        .default('month')
        .messages({
            'any.only': "Period must be one of: 'today', 'week', 'month', 'year'",
        }),
});
