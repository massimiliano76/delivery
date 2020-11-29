import React, { useState, useEffect, useContext } from "react";
import ProductRepository from "../../repository/ProductRepository";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/Button";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Button from "@material-ui/core/Button";
import AddBoxIcon from "@material-ui/icons/AddBox";
import { AuthUserContext } from "../Session";
import { withFirebase } from "../Firebase";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    marginTop: theme.spacing.unit * 3,
    overflowX: "hide",
  },
  table: {
    minWidth: 340,
  },
}));

function Products(props) {
  const classes = useStyles();
  const [products, setProducts] = useState([]);
  const authUser = useContext(AuthUserContext);
  ProductRepository.setOrderRepositoryFirebase(props.firebase, authUser);

  useEffect(() => {
    setProducts(ProductRepository.all());
  }, []);

  const deleteProductHandler = (productId) => (event) => {
    ProductRepository.delete(productId);
    setProducts(ProductRepository.all());
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TableContainer component={Paper}>
          <Table
            stickyHeader
            className={classes.table}
            aria-label="simple table"
          >
            <TableHead>
              <TableRow>
                <TableCell align="right">Descrição</TableCell>
                <TableCell align="right">Dinheiro</TableCell>
                <TableCell align="right">Cartão</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow hover key={product.id}>
                  <TableCell align="right">{product.description}</TableCell>
                  <TableCell align="right">{product.cash}</TableCell>
                  <TableCell align="right">{product.card}</TableCell>
                  <TableCell align="right">
                    <ButtonGroup
                      size="small"
                      aria-label="small outlined button group"
                    >
                      <IconButton
                        color="secondary"
                        aria-label="delete"
                        onClick={deleteProductHandler(product.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                      <IconButton
                        color="primary"
                        href={`/products/${product.id}`}
                      >
                        <EditIcon />
                      </IconButton>
                    </ButtonGroup>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      <Grid item xs={12}>
        <Button
          fullWidth
          color="primary"
          variant="contained"
          startIcon={<AddBoxIcon />}
          href={`/products/add`}
        >
          Adicionar
        </Button>
      </Grid>
    </Grid>
  );
}

export default withFirebase(Products);
