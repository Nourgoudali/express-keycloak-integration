const mongoose=require("mongoose");
const profilSchema = new mongoose.Schema({
    userId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cin:{type:String,required:true,unique:true},
    niveauEtude:{type: String, trim: true},
    telephone:{type:String,required:true},
    filiere:{type:String ,trim:true,required:true},
    country: { type: String, trim:true },
    region: { type: String, trim: true },
    city: { type: String, trim: true },
    photo:{type: String}
})
module.exports = mongoose.model('Profil', profilSchema);