/**
 * BodinPleiades
 */
var BodinPleiades = function() {
	//------------------------------------------------------------
	//	  This class is a singleton.	Ensure only one instance exists.
	//------------------------------------------------------------
	if ( BodinPleiades.prototype._singleton ) {
		return BodinPleiades.prototype._singleton;
	}
	BodinPleiades.prototype._singleton = this;
}