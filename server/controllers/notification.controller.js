import Notification from "../models/notification.model.js"

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id
        const notification = await Notification.find({ to: userId }).populate({
            path: 'from',
            select: 'username profileImg'
        })
        await Notification.updateMany({ to: userId }, { read: true })
        res.status(200).json(notification)
    } catch (error) {
        res.status(404).json(error.message)
    }
}

export const deleteAllNotifications = async (req, res) => {
    try {
        const userId = req.user._id
        await Notification.deleteMany({ to: userId })
        res.status(200).json({ message: 'Notifications deleted successfully' })
    } catch (error) {
        res.status(404).json(error.message)
    }
}

export const deleteSingleNotifications = async (req, res) => {
    try {
        const notificationId = req.params.id
        const notification = await Notification.findById(notificationId)
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' })
        }
        if (notification.to.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized to delete this notification' })
        }

        await Notification.findByIdAndDelete(notificationId)
        res.status(200).json({ message: 'Notification deleted successfully' })
    } catch (error) {
        res.status(404).json(error.message)
    }
}