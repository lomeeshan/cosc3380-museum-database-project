(async () => {
    if (!await Museum.init()) return;

    const form = document.getElementById('ticketForm');
    if (!['Admin', 'Sales Staff'].includes(Museum.user.role)) {
        Museum.notify('ticketMessage', 'Ticket sales require Admin or Sales Staff permission.', true);
        form.classList.add('hidden');
        return;
    }

    try {
        const visitors = await Museum.api('/api/entities/visitors');
        const exhibitions = await Museum.api('/api/entities/exhibitions');

        for (const visitor of visitors) {
            const option = document.createElement('option');
            option.value = visitor.VisitorID;
            option.textContent = `${visitor.FirstName} ${visitor.LastName} (#${visitor.VisitorID})`;
            document.getElementById('visitorId').append(option);
        }
        for (const exhibition of exhibitions) {
            const option = document.createElement('option');
            option.value = exhibition.ExhibitionID;
            option.textContent = exhibition.ExhibitionTitle;
            document.getElementById('exhibitionId').append(option);
        }
    } catch (error) {
        Museum.notify('ticketMessage', error.message, true);
    }

    async function refresh() {
        const tickets = await Museum.api('/api/tickets');
        Museum.table('ticketRows', [
            'TicketID', 'TicketTime', 'VisitDate', 'ExpirationDateTime',
            'TicketStatus', 'TicketType', 'TicketPrice', 'VisitorName', 'ExhibitionTitle'
        ], tickets);
    }

    form.onsubmit = async event => {
        event.preventDefault();
        const exhibitionId = document.getElementById('exhibitionId').value;
        const visitDate = document.getElementById('visitDate').value;

        try {
            const result = await Museum.api('/api/tickets', {
                method: 'POST',
                body: JSON.stringify({
                    visitorId: Number(document.getElementById('visitorId').value),
                    ticketType: document.getElementById('ticketType').value,
                    exhibitionId: exhibitionId ? Number(exhibitionId) : null,
                    visitDate
                })
            });
            Museum.notify('ticketMessage',
                `${result.message}: #${result.ticketId} · $${result.price} · Expires ${result.expiresAt}`);
            await refresh();
        } catch (error) {
            Museum.notify('ticketMessage', error.message, true);
        }
    };

    try { await refresh(); }
    catch (error) { Museum.notify('ticketMessage', error.message, true); }
})();