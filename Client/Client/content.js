
function getTemplates() {
    return new Promise(function(resolve) {
        $.ajax({
            url: chrome.runtime.getURL('Client/templates.html'),
            success: function(data) {
                var $templates = $('<div></div>').append($.parseHTML(data)).find('script'),
                    templates = {};
                $templates.each(function() {
                    templates[this.id] = this.innerHTML;
                });
                return resolve(templates);
            }
        });
    });
}

getTemplates().then(function(templates) {
    console.log(templates.template1); // <div class="template1">template1</div>
    console.log(templates.template2); // <div class="template2">template2</div>
});