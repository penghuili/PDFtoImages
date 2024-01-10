import { Anchor, Box, Button, FileInput, Heading, Text, TextInput } from 'grommet';
import React, { useState } from 'react';
import { RiCloseLine } from 'react-icons/ri';
import styled from 'styled-components';
import Modal from '../shared/react-pure/Modal';
import Spacer from '../shared/react-pure/Spacer';

const Wrapper = styled.div`
  margin: 0 auto;
  max-width: 750px;
  width: 100%;
  padding: 0 2rem;
`;

const CanvasWrapper = styled.div`
  paddding: 0.5rem;
  margin-bottom: 1rem;
  width: 100%;
  border: 1px dashed gray;

  canvas {
    width: 100%;
  }
`;

function PDFtoImages({ onToast }) {
  const [file, setFile] = useState();
  const [startPage, setStartPage] = useState('');
  const [endPage, setEndPage] = useState('');
  const [canvases, setCanvases] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  function renderDownloadButton() {
    if (!canvases.length) {
      return null;
    }

    return (
      <>
        <Spacer />
        <Button
          disabled={!canvases.length}
          label="Download images"
          onClick={() => {
            setShowSuccessModal(true);
          }}
        />
        <Spacer />
        <Button label="Clear images" plain onClick={() => setCanvases([])} />
      </>
    );
  }

  return (
    <Wrapper>
      <Box align="start">
        <Text weight="bold">Choose PDF</Text>
        <FileInput
          label="Choose PDF"
          accept="application/pdf"
          onChange={e => setFile(e.target.files?.[0])}
        />
        <Spacer />

        <Text weight="bold">Start page</Text>
        <TextInput type="number" value={startPage} onChange={e => setStartPage(+e.target.value)} />

        <Text weight="bold">End page</Text>
        <TextInput type="number" value={endPage} onChange={e => setEndPage(+e.target.value)} />

        <Spacer />

        <Button
          disabled={!file || isConverting}
          primary
          label="Convert"
          onClick={() => {
            setIsConverting(true);
            const pdfjsLib = window.globalThis.pdfjsLib;
            pdfjsLib.GlobalWorkerOptions.workerSrc =
              'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs';

            const fileReader = new FileReader();
            fileReader.onload = async e => {
              const typedarray = new Uint8Array(e.target.result);

              setCanvases([]);
              const newCanvases = [];
              const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
              for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                if ((!startPage || pageNum >= startPage) && (!endPage || pageNum <= endPage)) {
                  const page = await pdf.getPage(pageNum);
                  const viewport = page.getViewport({ scale: 3 });
                  const canvas = document.createElement('canvas');
                  const context = canvas.getContext('2d');
                  canvas.height = viewport.height;
                  canvas.width = viewport.width;

                  newCanvases.push({ page: pageNum, canvas });

                  page.render({
                    canvasContext: context,
                    viewport: viewport,
                  });
                }
              }

              setCanvases(newCanvases);
              setIsConverting(false);
              onToast('Done! You can download them now!');
            };
            fileReader.readAsArrayBuffer(file);
          }}
        />

        {renderDownloadButton()}

        {!!canvases.length && (
          <>
            <Heading level="3" margin="3rem 0 1rem 0">
              Result:
            </Heading>
            {canvases.map(canvas => (
              <CanvasWrapper key={canvas.page} ref={el => el && el.appendChild(canvas.canvas)} />
            ))}
            {renderDownloadButton()}
          </>
        )}

        <Modal show={showSuccessModal} onClose={() => setShowSuccessModal(false)}>
          <Box justify="end" direction="row">
            <Button icon={<RiCloseLine />} onClick={() => setShowSuccessModal(false)}>
              Close
            </Button>
          </Box>
          <Spacer />
          <Anchor href="https://buy.stripe.com/14k3fYcz633kb2oeV1" target="_blank">
            Buy me a beer 🍺
          </Anchor>
          <Spacer />
          <Button
            disabled={!canvases.length}
            label="Download now"
            onClick={() => {
              const zip = new window.JSZip();
              const folderName = 'mobilepdf-images';
              const imgFolder = zip.folder(folderName);

              for (let i = 0; i < canvases.length; i++) {
                imgFolder.file(
                  `page-${(+startPage || 1) + i}.png`,
                  canvases[i].canvas.toDataURL().split(',')[1],
                  {
                    base64: true,
                  }
                );
              }

              zip.generateAsync({ type: 'blob' }).then(function (content) {
                window.saveAs(content, `${folderName}.zip`);
                setShowSuccessModal(false);
              });
            }}
          />
        </Modal>
      </Box>
    </Wrapper>
  );
}

export default PDFtoImages;
