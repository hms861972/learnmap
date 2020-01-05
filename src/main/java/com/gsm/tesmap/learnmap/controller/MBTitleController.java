package com.gsm.tesmap.learnmap.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.sql.*;
import java.util.logging.Level;
import java.util.logging.Logger;

@Controller
public class MBTitleController {

    @RequestMapping("/MBTilesServlet")
    public void mbtitleServlet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException{
        //获取浏览器传递参数值
        String tile_column = request.getParameter("X");
        String tile_row = request.getParameter("Y");
        String zoom_level = request.getParameter("L");
        String mapname = request.getParameter("T");
        //判断sqlite连接引擎是否存在
        try {
            Class.forName("org.sqlite.JDBC");
        } catch (ClassNotFoundException e) {
            // TODO Auto-generated catch block
            // e.printStackTrace();
            System.out.println("数据库驱动未找到!");
        }
        Connection conn = null;
        ResultSet rs = null;
        try {
            //conurl：获取mbtiles文件地址
            String conurl = "jdbc:sqlite:E:\\GIS\\MAP\\SqliteMaps\\" + mapname + "\\" + zoom_level + ".mbtiles";
            conn = DriverManager.getConnection(conurl, null, null);
            // 设置自动提交为false
            conn.setAutoCommit(false);
            Statement stmt = conn.createStatement();
            //判断表是否存在
            ResultSet rsTables = conn.getMetaData().getTables(null, null, "tiles", null);
            if(!rsTables.next()){
                System.out.println(zoom_level+"X:"+tile_column+"Y:"+tile_row+"表不存在");
            }
            // 得到结果集
            String sql = "SELECT * FROM tiles WHERE zoom_level = "+zoom_level+
                    " AND tile_column = "+tile_column+
                    " AND tile_row = "+tile_row;
            rs = stmt.executeQuery(sql);
            if(rs.next()) {
                byte[] imgByte = (byte[]) rs.getObject("tile_data");
                InputStream is = new ByteArrayInputStream(imgByte);
                OutputStream os = response.getOutputStream();
                try {
                    int count = 0;
                    byte[] buffer = new byte[256 * 256];
                    while ((count = is.read(buffer)) != -1) {
                        os.write(buffer, 0, count);
                    }
                    os.flush();
                } catch (IOException e) {
                    e.printStackTrace();
                } finally {
                    os.close();
                    is.close();
                }
            }
            else{
                System.out.println(sql);
                System.out.println(zoom_level+"X:"+tile_column+"Y:"+tile_row+"未找到图片！");
            }

        } catch (SQLException ex) {
           // System.out.println("SQL异常!");
            //Logger.getLogger(MBTitleController.class.getName()).log(Level.SEVERE, null, ex);
        }finally {
            try {
                if (rs != null)
                rs.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }finally {
                try {
                    if (conn != null)
                    conn.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
