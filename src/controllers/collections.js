const Collections = require("../models/Collection");
const User = require("../models/User");

exports.getCollections = async (req, res) => {
  try {
    const collections = await Collections.find();
    if (!collections) {
      return res.status(404).json({
        code: 404,
        message: "Collections not found!",
      });
    }
    const filteredCollections = collections.filter(collection => collection.name !== " ");

    return res.status(200).json({
      code: 200,
      message: "Collections fetched successfully!",
      data: filteredCollections,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};


exports.getCollectionsS = async (req, res) => {
  try {
    const collections = await Collections.find();
    if (!collections) {
      return res.status(404).json({
        code: 404,
        message: "Collections not found!",
      });
    }
    return res.status(200).json({
      code: 200,
      message: "Collections fetched successfully!",
      data: collections,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};



exports.getCollection = async (req, res) => {
  try {
    const collection = await Collections.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({
        code: 404,
        message: `Collection not found with id: ${req.params.id}`,
      });
    }

    return res.status(200).json({
      code: 200,
      data: collection,
    });
  } catch (error) {
    console.error("Error while getting collection: ", error);
    res.status(500).json({ code: 500, message: error.message });
  }
};

exports.createCollection = async (req, res) => {
  try {
    const { uid, name } = req.body;

    const findAdmin = await User.findById(req.user.id);
    var collection;
    if (findAdmin.role == "admin") {
      collection = new Collections({
        name,        
      });
      await collection
        .save()
        .then((result) => {
          return res.status(200).json({
            code: 200,
            message: "Collection created successfully!",
            data: result,
          });
        })
        .catch((error) => {
          return res.status(400).json({ code: 400, message: error.message });
        });
    } else {
      return res.status(403).json({ code: 403, message: "You are not Admin" });
    }
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.editCollection = async (req, res) => {
  const { collectionId, name } = req.body;

  const collectionData = await Collections.findById(collectionId);

  try {
    const findAdmin = await User.findById(req.user.id);
    if (findAdmin.role == "admin") {
      let dataToUpdate = {
          ...req.body,
        };

        await Collections.findByIdAndUpdate(collectionId, {
          ...dataToUpdate,
        })
          .then((result) => {
            return res.status(200).json({
              code: 200,
              message: "Collection updated successfully!",
            });
          })
          .catch((error) => {
            return res.status(400).json({ code: 400, message: error.message });
          });
    } else {
      return res.status(403).json({ code: 403, message: "You are not Admin" });
    }
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.deleteCollection = async (req, res) => {
  const { collectionId } = req.body;
  console.log("collectionId", collectionId);
  try {
    const findAdmin = await User.findById(req.user.id);

    console.log("findAdmin", findAdmin);

    if (findAdmin.role == "admin") {
      await Collections.findByIdAndDelete(collectionId)
        .then((result) => {
          return res
            .status(200)
            .json({ code: 200, message: "Collection deleted successfully!" });
        })
        .catch((error) => {
          console.log(error, "Check");
          return res.status(400).json({ code: 400, message: error.message });
        });
    } else {
      return res.status(403).json({ code: 403, message: "You are not Admin" });
    }
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.swapCollection = async (req, res) => {
  const { firstID, secondID } = req.body;

  const firstCollection = await Collections.findById(firstID);
  const secondCollection = await Collections.findById(secondID);

  try {
    const findAdmin = await User.findById(req.user.id);
    if (findAdmin.role == "admin") {
      await Collections.findByIdAndUpdate(firstID, {
        name: secondCollection.name,
      });
      await Collections.findByIdAndUpdate(secondID, {
        name: firstCollection.name,
      });
      return res.status(200).json({
        code: 200,
        message: "Collections updated successfully!",
      });
    } else {
      return res.status(403).json({ code: 403, message: "You are not Admin" });
    }
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};
