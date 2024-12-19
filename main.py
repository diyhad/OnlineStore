import ast
import os

from fastapi import FastAPI, Depends
from fastapi.responses import HTMLResponse, StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker, Session
from starlette.requests import Request

app = FastAPI()
templates = Jinja2Templates(directory="templates")

app.mount("/static", StaticFiles(directory="static"), name="static")

DATABASE_URL = "sqlite:///./barrette.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.on_event("startup")
async def startup():
    print("Current working directory:", os.getcwd())
    print("Database path:", os.path.abspath("./barrette.db"))

    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print("Tables in database:", tables)

    if "items" in tables:
        columns = inspector.get_columns("items")
        print("Columns in items table:", columns)

    query = text("SELECT COUNT(*) FROM items")
    with engine.connect() as conn:
        result = conn.execute(query)
        count = result.scalar()
        print(f"Number of products in the database: {count}")


@app.get("/", response_class=HTMLResponse)
async def read_homepage(request: Request, db: Session = Depends(get_db)):
    query = text("SELECT id, en_name, description FROM items ORDER BY RANDOM() LIMIT 16")
    result = db.execute(query)
    items = result.fetchall()

    items_dict = []
    for item in items:
        item_data = {
            "id": item[0],
            "en_name": item[1],
            "description": item[2],
            "image_url": f"/image/{item[0]}/0",
        }

        items_dict.append(item_data)

    print(f"Number of items fetched: {len(items_dict)}")

    return templates.TemplateResponse("index.html", {"request": request, "items": items_dict})


@app.get("/image/{item_id}/{image_index}")
async def get_image(item_id: int, image_index: int, db: Session = Depends(get_db)):
    query = text("SELECT images FROM items WHERE id = :id")
    result = db.execute(query, {"id": item_id})
    images_data = result.scalar()

    if images_data is None:
        return HTMLResponse(status_code=404, content="Images not found")

    images_list = ast.literal_eval(images_data)

    if image_index < 0 or image_index >= len(images_list):
        return HTMLResponse(status_code=404, content="Image index out of range")

    image_path = images_list[image_index]

    if not os.path.exists(image_path):
        return HTMLResponse(status_code=404, content="Image file not found")

    return StreamingResponse(open(image_path, "rb"), media_type="image/png")


@app.get("/product/{product_id}", response_class=JSONResponse)
async def get_product_details(product_id: int, db: Session = Depends(get_db)):
    query = text(
        "SELECT id, en_name, short_description, product_type, images FROM items WHERE id = :id"
    )
    result = db.execute(query, {"id": product_id})
    product = result.fetchone()

    if not product:
        return JSONResponse(status_code=404, content={"error": "Product not found"})

    images_data = ast.literal_eval(product[4]) if product[4] else []

    images_urls = [f"/image/{product[0]}/{i}" for i in range(len(images_data))]

    product_data = {
        "id": product[0],
        "en_name": product[1],
        "description": product[2],
        "category": product[3],
        "images": images_urls,
    }

    return JSONResponse(content=product_data)


@app.get("/products", response_class=HTMLResponse)
async def products_page(
    request: Request,
    category: str = None,
    page: int = 1,
    limit: int = 16,
    db: Session = Depends(get_db),
):
    offset = (page - 1) * limit

    category_mapping = {
        "shampoo": "ШАМПОАН ЗА КОСА",
        "mask": "МАСКА ЗА КОСА",
        "conditioner": "БАЛСАМ ЗА КОСА",
        "nourishing": "ПОДХРАНВАЩИ ЗА КОСА",
        "spray": "СПРЕЙ ЗА КОСА",
        "special": "СПЕЦИАЛНИ ЗА КОСА",
        "serum": "СЕРУМ",
        "ampoules": "АМПУЛИ",
        "oil": "ОЛИО ЗА КОСА",
        "gel": "ГЕЛ ЗА КОСА",
        "modeling_paste": "МОДЕЛИРАЩА ПАСТА ЗА КОСА",
        "gel_wax": "ГЕЛ-ВАКСА",
        "gel_cream": "ГЕЛ-КРЕМ",
        "mousse_foam": "МУС-ПЯНА",
        "powder": "ПУДРА",
        "gel_foam": "ГЕЛ-ПЯНА",
        "foam": "ПЯНА ЗА КОСА",
        "spray_foam": "СПРЕЙ-ПЯНА",
        "paste": "ПАСТА",
        "styling": "СТИЛИЗАНТ",
        "cream": "КРЕМ ЗА КОСА",
    }

    product_type = category_mapping.get(category) if category else None

    query = text("SELECT id, en_name, description, product_type, images FROM items WHERE 1=1")
    params = {"limit": limit, "offset": offset}

    if product_type:
        query = text(f"{query} AND product_type = :product_type")
        params["product_type"] = product_type

    query = text(f"{query} LIMIT :limit OFFSET :offset")

    result = db.execute(query, params)
    products = result.fetchall()

    products_dict = []
    for product in products:
        images_data = ast.literal_eval(product[4]) if product[4] else []
        images_urls = [f"/image/{product[0]}/{i}" for i in range(len(images_data))]

        product_data = {
            "id": product[0],
            "en_name": product[1],
            "description": product[2],
            "category": product[3],
            "images": images_urls,
        }
        products_dict.append(product_data)

    count_query = text("SELECT COUNT(*) FROM items WHERE 1=1")
    if product_type:
        count_query = text(f"{count_query} AND product_type = :product_type")
        params["product_type"] = product_type

    count_result = db.execute(count_query, params)
    total_items = count_result.scalar()
    total_pages = (total_items + limit - 1) // limit  # Ceiling division

    return templates.TemplateResponse(
        "product.html",
        {
            "request": request,
            "products": products_dict,
            "category": category,
            "page": page,
            "total_pages": total_pages,
        },
    )


@app.get("/about", response_class=HTMLResponse)
async def about_page(request: Request):
    return templates.TemplateResponse("about.html", {"request": request})


@app.get("/contact", response_class=HTMLResponse)
async def about_page(request: Request):
    return templates.TemplateResponse("contact.html", {"request": request})
