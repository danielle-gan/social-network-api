const { Thought, User } = require('../models');

const thoughtController = {
    getAllThoughts(req, res) {
        Thought.find({})
            .populate({
                path: 'reactions',
                select: '-__v'
            })
            .populate({
                path: 'thoughtText',
                select: '-__v',
            })
            .select('-__v')
            .sort({ _id: -1 })
            .then(dbData => res.json(dbData))
            .catch(err => { res.status(400).json(err) });
    },

    createThought({ body }, res) {
        Thought.create(body)
            .then(({ _id }) => {
                return User.findOneAndUpdate(
                    { username: body.username },
                    { $push: { thoughts: _id } },
                    { new: true, runValidators: true }
                );
            })
            .then(dbData => {
                if (!dbData) {
                    res.status(404).json({ message: 'No thought found with this ID!' });
                    return;
                }
                res.json(dbData);
            })
            .catch(err => res.json(err));
    },

    getThoughtById({ params }, res) {
        Thought.findOne({ _id: params.id })
            .populate({
                path: 'reactions',
                select: '-__v'
            })
            .select('-__v')
            .then(dbData => {
                if (!dbData) {
                    res.status(404).json({ message: 'No thought found with this ID!' });
                    return;
                }
                res.json(dbData);
            })
            .catch(err => { res.status(400).json(err) });
    },
    deleteThought({ params }, res) {
        Thought.findOneAndDelete({ _id: params.id })
            .then(dbData => {
                if (!dbData) {
                    res.status(404).json({ message: 'No thought found with this ID!' });
                    return;
                }
                res.json(dbData);
            })
            .catch(err => res.status(400).json(err));
    },
    updateThought({ params, body }, res) {
        Thought.findOneAndUpdate(
            { _id: params.id }, body, { new: true, runValidators: true })
            .then(dbData => {
                if (!dbData) {
                    res.status(404).json({ message: 'No thought found with this ID!' });
                    return;
                }
                res.json(dbData);
            })
            .catch(err => res.status(400).json(err));
    },
    createReaction({ params, body }, res) {
        Thought.findOneAndUpdate(
            { _id: params.thoughtId },
            { $push: { reactions: body } },
            { new: true, runValidators: true }
        )
            .then((dbData) => {
                if (!dbData) {
                    res.status(404).json({ message: 'No Thought found with this ID!' });
                    return;
                }
                res.json(dbData);
            })
            .catch((err) => { res.status(400).json(err) });
    },
    deleteReaction({ params }, res) {
        Thought.findOneAndUpdate(
            { _id: params.thoughtId },
            { $pull: { reactions: { reactionId: params.reactionId } } },
            { new: true }
        )
            .then((dbData) => {
                if (!dbData) {
                    res.status(404).json({ message: 'No thought found with this ID!' });
                    return;
                }
                res.json(dbData);
            })
            .catch((err) => { res.status(400).json(err) });
    }
}

module.exports = thoughtController;