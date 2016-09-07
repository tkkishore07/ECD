jQuery.sap.declare("HR.util.PopupDrag");
HR.util.PopupDrag = {
    
    draggable: function(id) {
	  
	    $("div[id^='"+id+"'][id$='header-BarPH']").css('cursor','move'); // Chaging the cursor for header holding which user can drag the pop up
	    var popup = document.getElementById(document.querySelector('div[id^='+id+']').id); // get the pop up id from the dom
	    var popupBar = document.getElementById(document.querySelector('div[id^="'+id+'"][id$="header-BarPH"]').id); // get the pop up header id
	    var SCROLL_WIDTH = 24;
	    var offset = { x: 0, y: 0 }; 
        popupBar.addEventListener('mousedown', mouseDown, false); // Adding mousedown event listener to pop up header
        window.addEventListener('mouseup', mouseUp, false); // Adding mouseup event listener to pop up header

        function mouseUp() // on mouseup - remove the event listener
        {
            window.removeEventListener('mousemove', popupMove, true);
        }
    
        function mouseDown(e){ // on mouse down fetch popup's current position 
            offset.x = e.clientX - popup.offsetLeft; 
            offset.y = e.clientY - popup.offsetTop;
            window.addEventListener('mousemove', popupMove, true);// adding mouse move event listener
        }
    
        function popupMove(e){ // When mouse moves keep on changing the coordinates according to the movement
            popup.style.position = 'absolute';
            var top = e.clientY - offset.y;
            var left = e.clientX - offset.x;
            popup.style.top = top + 'px'; // Setting the new coordinates and displaying the pop up on new position
            popup.style.left = left + 'px';
        }

	}
    
    
};