import React from "react";
import { Container, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";

import Highlight from "../components/Highlight";
import Loading from "../components/Loading";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";

export const ProfileComponent = () => {
  const { user, logout } = useAuth0();

  const logoutWithRedirect = () =>
    logout({
        logoutParams: {
            returnTo: window.location.origin,
        }
    });

  return (
    <Container className="mb-5 mt-5">
      <Row className="align-items-center profile-header mb-5 text-center text-md-left">
        <Col md={2} className="flex justify-center">
          <img
            src={user.picture}
            alt="Profile"
            className="rounded-circle img-fluid profile-picture mb-3 mb-md-0"
          />
        </Col>
        <Col md>
          <p className="lead text-muted">{user.email}</p>
        </Col>
      </Row>
      <Row>
        <Col className="flex justify-center">
          <Link onClick={() => logoutWithRedirect()} className="px-4 py-2 bg-dol-green text-white rounded">
            Log out
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default withAuthenticationRequired(ProfileComponent, {
  onRedirecting: () => <Loading />,
});
