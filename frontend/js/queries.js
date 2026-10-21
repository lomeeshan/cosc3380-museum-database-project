(async () => {
  if (!await Museum.init()) return;

  async function loadOptions(url, selectId, idKey, labelKey) {
    const rows = await Museum.api(url);
    const select = document.getElementById(selectId);
    for (const row of rows) {
      const option = document.createElement('option');
      option.value = row[idKey];
      option.textContent = row[labelKey];
      select.append(option);
    }
  }

  try {
    await loadOptions('/api/entities/artists', 'artistId', 'ArtistID', 'ArtistName');
    await loadOptions('/api/entities/exhibitions', 'employeeExhibitionId', 'ExhibitionID', 'ExhibitionTitle');
    await loadOptions('/api/entities/exhibitions', 'artworkExhibitionId', 'ExhibitionID', 'ExhibitionTitle');
  } catch (error) {
    Museum.notify('queryMessage', error.message, true);
  }

  const forms = [
    ['artistForm', 'artistId', 'artworks-by-artist', 'artistId', 'artistRows',
      ['ArtistName', 'ArtworkID', 'Title', 'Medium']],
    ['employeeExhibitionForm', 'employeeExhibitionId', 'employees-by-exhibition', 'exhibitionId', 'employeeExhibitionRows',
      ['ExhibitionTitle', 'EmployeeID', 'EmployeeName', 'JobTitle', 'AssignmentRole']],
    ['artworkExhibitionForm', 'artworkExhibitionId', 'artworks-by-exhibition', 'exhibitionId', 'artworkExhibitionRows',
      ['ExhibitionTitle', 'ArtworkID', 'Title', 'Medium']]
  ];

  for (const [formId, inputId, route, parameter, outputId, columns] of forms) {
    document.getElementById(formId).onsubmit = async event => {
      event.preventDefault();
      const value = document.getElementById(inputId).value;
      try {
        const path = '/api/queries/' + route + '?' + parameter + '=' + encodeURIComponent(value);
        const rows = await Museum.api(path);
        Museum.table(outputId, columns, rows);
        Museum.notify('queryMessage', rows.length + ' matching record(s)');
      } catch (error) {
        Museum.notify('queryMessage', error.message, true);
      }
    };
  }
})();