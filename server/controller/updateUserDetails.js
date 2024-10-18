const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");
const UserModel = require("../models/UserModel");

async function updateUserDetails(request, response) {
    try {
        const token = request.cookies.token || "";

        // Get the user details using the token
        const user = await getUserDetailsFromToken(token);

        // Check if the user is found
        if (!user) {
            return response.status(401).json({
                message: "User not authenticated",
                success: false
            });
        }

        const { name, profile_pic } = request.body;

        // Update the user with new name and profile picture
        const updatedUser = await UserModel.findByIdAndUpdate(
            user._id,
            {
                name,
                profile_pic
            },
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            return response.status(404).json({
                message: "User not found",
                success: false
            });
        }

        // Return the updated user information
        return response.status(200).json({
            message: "User updated successfully",
            data: updatedUser,
            success: true
        });

    } catch (error) {
        console.error(error); // Log the error for debugging
        return response.status(500).json({
            message: error.message || "Server Error",
            success: false
        });
    }
}

module.exports = updateUserDetails;
