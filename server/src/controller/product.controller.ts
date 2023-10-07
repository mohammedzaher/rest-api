import { Request, Response } from 'express';
import {
  DeleteProductInput,
  ReadProductInput,
  UpdateProductInput,
} from '../schema/product.schema';
import {
  createProduct,
  deleteProduct,
  findAndUpdateProduct,
  findProduct,
} from '../service/product.service';
import { UserDocument } from '../models/user.model';

import { ProductInput } from '../models/product.model';

export async function createProductHandler(
  req: Request<{}, {}, ProductInput>,
  res: Response
) {
  const userId = res.locals.user._id as UserDocument['_id'];

  const body = req.body;
  const product = await createProduct({
    ...body,
    user: userId,
  });
  return res.send(product);
}

export async function updateProductHandler(
  req: Request<UpdateProductInput['params']>,
  res: Response
) {
  const userId = res.locals.user._id;

  const productId = req.params.productId;

  const update = req.body;

  const product = await findProduct({ _id: productId });

  if (!product) {
    return res.sendStatus(404);
  }

  if (product.user._id != userId) {
    return res.sendStatus(403);
  }

  const updatedProduct = await findAndUpdateProduct(
    { _id: productId },
    update,
    { new: true }
  );

  return res.send(updatedProduct);
}

export async function getProductHandler(
  req: Request<ReadProductInput['params']>,
  res: Response
) {
  const productId = req.params.productId;
  const product = await findProduct({ _id: productId });

  if (!product) {
    return res.sendStatus(404);
  }

  return res.send(product);
}

export async function deleteProductHandler(
  req: Request<DeleteProductInput['params']>,
  res: Response
) {
  const userId = res.locals.user._id;

  const productId = req.params.productId;

  const product = await findProduct({ _id: productId });

  if (!product) {
    return res.sendStatus(404);
  }

  if (product.user != userId) {
    return res.sendStatus(403);
  }

  await deleteProduct({ _id: productId });

  return res.sendStatus(200);
}
