const timer = async (req, res) => {
    try {
        const createTimer = await timer.create({
            userId: req.userId,
            mode,
            title: title || "",
            startAt,
            endAt,
            timeZone,
            units,
            customization: customization || {}
            //it is an empty curly braces because in timer model cucstomization is an object
        })
        res.status(200).send({
            message: 'timer created',
            Data: createTimer
        })
        
    } catch (error) {
        console.log(error);
        res.status(400).send({
            message: 'error creating timer'
        })
        
        
    }
}

