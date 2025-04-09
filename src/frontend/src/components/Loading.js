import React from "react";
import { Spinner, Container, Row, Col } from "reactstrap";

const Loading = () => (
  <>
    <div className="flex justify-center align-middle">
      <Spinner color="primary" type="grow" className="my-5 text-center" children={null}></Spinner>
    </div>

  </>

);

export default Loading;
