const router = require('express').Router();

const { isAuth, isOwner } = require('../middlewares/guards');
const preload = require('../middlewares/preloads');
const { create,getAll,getById,remove,update, getCollectionLength, findByOwner } = require('../services/projects');
const { parseError } = require('../util');

router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 2;
    const query = {};

    try {
        if(req.query.where){
            const ownerId = req.query.where.split('_ownerId=')[1];
            if (ownerId) {
                query._ownerId = ownerId;
                const projects = await findByOwner(ownerId)
            }
        } else {
            const projects = await getAll(query, page, pageSize);
            const totalProjects = await getCollectionLength(query);
    
            res.json({ projects, totalProjects });
        }

    } catch (err) {
        if (!res.headersSent) {
            res.status(500).json({ message: err.message });
        } else {
            console.error('Response already sent:', err);
        }
    }
});

router.post('/', isAuth(), async (req, res) => {
    console.log(req.body)
    const data = {
        title: req.body.title,
        description: req.body.description,
        // img: {type: String, required: [true, 'Image URL is required!']},
        language: req.body.language,
        code: req.body.code,
        date: new Date(req.body.date),
        owner: req.user._id,
    };
    try{
        const project = await create(data);
    
        res.status(201).json({ success: true, data: project});
    } catch(err){
        const message = parseError(err);
        res.status(err.status || 400).json({message});
    }
});

router.get('/:id', preload(), async (req, res) => {
    // item is already set by the preload func middlewarre
    const project = req.data.toObject();
    project._ownerId = project.owner.toString();
    
    res.json(project);
});

router.put('/:id', isAuth(), preload(), isOwner(), async (req, res) => {
    const updated = {
        title: req.body.title,
        description: req.body.description,
        // img: {type: String, required: [true, 'Image URL is required!']},
        code: req.body.code,
        dateDiscovered: req.body.dateDiscovered
    };

    try{
        const updatedProject = await update(req.data, updated);

        res.json(updatedProject);
    } catch(err){
        const message = parseError(err);
        res.status(err.status || 400).json({ message });
    }
})

router.delete('/:id', isAuth(), preload(), isOwner(), async (req, res) => {
    try{
        await remove(req.params.id);
        res.status(204).end();
    } catch(err){
        res.status(err.status || 400).json({ message: err.message });
    }
});

module.exports = router;

